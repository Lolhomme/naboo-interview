 import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

const isServer = typeof window === "undefined";

export const createApolloClient = (options?: {
  headers?: Record<string, string | string[] | undefined>;
}) => {
  const { headers } = options || {};
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: "http://localhost:3000/graphql",
      credentials: "include",
      // Provide headers for SSR so cookie auth flows through
      headers: headers as any,
    }),
    ssrMode: isServer,
  });
};

// Simple singleton. For SSR, prefer createApolloClient(headers) in data fetching methods.
export const graphqlClient = createApolloClient();
