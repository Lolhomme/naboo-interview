import { ApolloClient, HttpLink, InMemoryCache, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const isServer = typeof window === "undefined";

export const createApolloClient = (options?: {
  headers?: Record<string, string | string[] | undefined>;
}) => {
  const { headers } = options || {};
  // Attach JWT from localStorage as 'jwt' header on browser requests
  const authLink = setContext((_, { headers: reqHeaders }) => {
    if (isServer) return { headers: reqHeaders };
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
      headers: {
        ...(reqHeaders || {}),
        ...(token ? { jwt: token } : {}),
      },
    };
  });

  const httpLink = new HttpLink({
    uri: "http://localhost:3000/graphql",
    credentials: "include",
    // Provide headers for SSR so cookie auth flows through
    headers: headers as any,
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: from([authLink, httpLink]),
    ssrMode: isServer,
  });
};

// Simple singleton. For SSR, prefer createApolloClient(headers) in data fetching methods.
export const graphqlClient = createApolloClient();
