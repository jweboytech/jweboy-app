export const runtime = "edge";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import React from "react";
import apolloClient from "../../client";
import { GET_REDNOTE } from "./gql";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Highlighter from "react-highlight-words";

const tabs = [
  { id: "specified_condition", label: "特定条件" },
  { id: "partially_friendly", label: "部分友好" },
  { id: "prohibit_landing", label: "禁止落地" },
  { id: "allow_landing", label: "允许落地" },
  { id: "washrooms", label: "洗手间" },
  { id: "parking", label: "停车场" },
];

const regexMap = {
  specified_condition:
    /带狗.*要|cm.*以|kg.*以|斤.*以|带宠物.*要|出示|提供|签|疫苗|型犬|限|不超过/,
  partially_friendly: /不可.*进|严禁.*宠物|严禁|谢绝|部分/,
  prohibit_landing: /要.*车|要.*抱着/,
  allow_landing: /可以.*下地/,
  washrooms: /有.*洗手间|有.*厕所|洗手间.*有|有厕所|厕所.*在/,
  parking:
    /停车场|提供.*停车场|可以.*停车|有.*停车场|在.*停好|停车.*可供|可.*停|.*\/小时|停车免费|路边停|停车.*攻略|有.*停车|停车方便|路边停车|停车.*免费|停车免费/,
};

const RednoteByIdPage = async ({ params }: { params: { id: string } }) => {
  const query = await params;
  const current = tabs.find((item) => item.id === query.id);
  console.log(query.id, current?.label);

  let allRedNotes = [];
  let afterCursor = null;
  let hasNextPage = true;

  while (hasNextPage) {
    console.log("request=>", query.id, current?.label);
    const { data, errors } = await apolloClient.query({
      query: GET_REDNOTE,
      variables: {
        first: 30, // Supabase 限制每次最多 30 条
        after: afterCursor,
        filter: {
          [query.id]: { eq: current?.label }, // 这里可以动态传入
        },
      },
    });

    console.log("inside", errors);

    // 提取新获取的记录
    const newRedNotes = data.red_noteCollection.edges.map((edge) => edge.node);
    allRedNotes = [...allRedNotes, ...newRedNotes];

    // 获取分页信息
    hasNextPage = data.red_noteCollection.pageInfo.hasNextPage;
    afterCursor = data.red_noteCollection.pageInfo.endCursor;
  }

  console.log(`获取到 ${allRedNotes.length} 条数据`);

  return (
    <div className="px-4 py-4 grid grid-cols-1 gap-4">
      <div className="flex justify-between items-center">
        <Tabs defaultValue={query.id}>
          <TabsList>
            {tabs.map((item) => (
              <TabsTrigger key={item.id} value={item.id}>
                <Link href={`/dashboard/rednote/${item.id}`}>{item.label}</Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <span>列表总计: {allRedNotes.length}条</span>
      </div>
      {allRedNotes.map((item) => {
        const regex = regexMap[query.id];
        const matches = item.description?.match(regex) || []; // 提取所有匹配项

        return (
          <Card key={item.id}>
            <CardHeader className="flex gap-3">
              <div className="flex flex-col">
                <p className="text-md">
                  <Link href={item.href}>{item.title}</Link>
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <Highlighter
                searchWords={matches}
                autoEscape={true}
                textToHighlight={item.description}
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default RednoteByIdPage;
