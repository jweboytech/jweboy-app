"use client";

import { useQuery } from "@apollo/client";
import React from "react";
import { GET_REDNOTE } from "./rednote/[id]/gql";

// https://supabase.com/dashboard/project/opxexvbkhavxloebnmwh/integrations/graphiql/graphiql

const DashboardPage = () => {
  const { loading, error, data } = useQuery(GET_REDNOTE);
  console.log(data);

  return <div>DashboardPage</div>;
};

export default DashboardPage;
