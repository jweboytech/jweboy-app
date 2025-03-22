import React from "react";
import { GET_REDNOTE } from "./[id]/gql";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import apolloClient from "../client";
import Highlighter from "react-highlight-words";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tabs = [
  { id: "specifiedCondition", label: "特定条件" },
  { id: "partiallyFriendly", label: "部分友好" },
  { id: "prohibitLanding", label: "禁止落地" },
  { id: "allowLanding", label: "允许落地" },
  { id: "washrooms", label: "洗手间" },
  { id: "parking", label: "停车场" },
];

const regexMap = {
  specifiedCondition:
    /带狗.*要|cm.*以|kg.*以|斤.*以|带宠物.*要|出示|提供|签|疫苗|型犬|限|不超过/,
  partiallyFriendly: /不可.*进|严禁.*宠物|严禁|谢绝|部分/,
  prohibitLanding: /要.*车|要.*抱着/,
  allowLanding: /可以.*下地/,
  washrooms: /有.*洗手间|有.*厕所|洗手间.*有|有厕所|厕所.*在/,
  parking:
    /停车场|提供.*停车场|可以.*停车|有.*停车场|在.*停好|停车.*可供|可.*停|.*\/小时|停车免费|路边停|停车.*攻略|有.*停车|停车方便|路边停车|停车.*免费|停车免费/,
};

const RednotePage = async () => {
  //   const { loading, error, data } = useQuery(GET_REDNOTE);
  //   const items = data?.red_noteCollection.edges.map((item) => item.node);
  //   console.log(items);

  let allRedNotes = [];
  let afterCursor = null;
  let hasNextPage = true;
  let isLoading = false;

  while (hasNextPage) {
    const { data, loading } = await apolloClient.query({
      query: GET_REDNOTE,
      variables: {
        first: 30, // Supabase 限制每次最多 30 条
        after: afterCursor,
      },
    });

    // 提取新获取的记录
    const newRedNotes = data.red_noteCollection.edges.map((edge) => edge.node);
    allRedNotes = [...allRedNotes, ...newRedNotes];

    // 获取分页信息
    hasNextPage = data.red_noteCollection.pageInfo.hasNextPage;
    afterCursor = data.red_noteCollection.pageInfo.endCursor;

    // loading
    isLoading = loading;
  }

  console.log(`获取到 ${allRedNotes.length} 条数据`);

  return (
    <div className="grid grid-cols-1 gap-4 px-4 py-4">
      <div>
        <Button>Next</Button>
      </div>
      <Tabs defaultValue="account" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
      </Tabs>

      {!isLoading ? (
        allRedNotes.map((item) => {
          //   const regex = regexMap[keyword];
          //   const matches = item.description.match("specifiedCondition") || []; // 提取所有匹配项

          return (
            <Card key={item.id}>
              <CardHeader className="flex gap-3">
                <div className="flex flex-col">
                  <p className="text-md">
                    {/* <Link href={item.href}>{item.title}</Link> */}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                {/* <Highlighter
                    searchWords={matches}
                  autoEscape={true}
                  textToHighlight={item.description}
                /> */}
                {item.description}
              </CardContent>
            </Card>
          );
        })
      ) : (
        <div>loading</div>
      )}
    </div>
  );
};

export default RednotePage;
