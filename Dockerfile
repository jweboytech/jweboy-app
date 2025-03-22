# --- 构建阶段 ---
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 仅拷贝 package.json 和 package-lock.json 进行依赖安装（加速缓存）
COPY package.json pnpm-lock.yaml ./

# 安装生产依赖
RUN npm i -g pnpm  --registry=https://registry.npmmirror.com
RUN pnpm install --force

# 拷贝剩余代码
COPY . .

# 构建 Next.js 生产版本
RUN npm run build

# --- 运行阶段 ---
FROM node:20-alpine AS runner

# 设置运行目录
WORKDIR /app

# 仅拷贝运行所需的文件，减少最终镜像体积
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

# 设置默认环境变量（可根据需要调整）
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NODE_ENV=production
ENV PORT=3000

# 暴露端口
EXPOSE 3000

# 运行 Next.js 生产模式
CMD ["node", "node_modules/.bin/next", "start"]
