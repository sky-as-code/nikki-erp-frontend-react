"use client";

import { Client, fetchExchange } from "@urql/core";
import createGraphqlProvider from "@refinedev/graphql";

const API_URL = "https://your-graphql-url/graphql";


export const createDataProvider = () => {
	const gqlClient = new Client({ url: API_URL, exchanges: [fetchExchange] });
	return createGraphqlProvider(gqlClient);
}

