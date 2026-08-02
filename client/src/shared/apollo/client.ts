import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
  Observable,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { STORAGE, GRAPHQL, ROUTES } from "@/shared/constants";

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_API_URL || GRAPHQL,
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(
    import.meta.env.VITE_TOKEN_NAME || STORAGE.token,
  );
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

let isRefreshing = false;
let pendingRequests: Array<() => void> = [];

function resolvePendingRequests() {
  pendingRequests.forEach((resolve) => resolve());
  pendingRequests = [];
}

async function refreshAccessToken(): Promise<void> {
  const currentRefreshToken = localStorage.getItem(STORAGE.refreshToken);
  if (!currentRefreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await fetch(GRAPHQL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        mutation RefreshToken($token: String!) {
          refreshToken(token: $token) {
            accessToken
            refreshToken
            user { id username }
          }
        }
      `,
      variables: { token: currentRefreshToken },
    }),
  });

  const json = await response.json();

  if (json.errors) {
    throw new Error("Refresh token failed");
  }

  const { accessToken, refreshToken, user } = json.data.refreshToken;
  localStorage.setItem(STORAGE.token, accessToken);
  localStorage.setItem(STORAGE.refreshToken, refreshToken);
  localStorage.setItem(STORAGE.user, JSON.stringify(user));
}

const errorLink = onError(
  ({ networkError, graphQLErrors, operation, forward }) => {
    if (networkError) {
      networkError.message = "Unable to connect. Is the server running?";
    }

    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        if (err.extensions?.code === "UNAUTHENTICATED") {
          // Don't try to refresh if this is already a refresh or login mutation
          if (
            operation.operationName === "RefreshToken" ||
            operation.operationName === "Login"
          ) {
            return;
          }

          if (!isRefreshing) {
            isRefreshing = true;

            return new Observable((observer) => {
              refreshAccessToken()
                .then(() => {
                  isRefreshing = false;
                  resolvePendingRequests();
                  // Retry the original operation with the new token
                  const subscriber = {
                    next: observer.next.bind(observer),
                    error: observer.error.bind(observer),
                    complete: observer.complete.bind(observer),
                  };
                  forward(operation).subscribe(subscriber);
                })
                .catch(() => {
                  isRefreshing = false;
                  pendingRequests = [];
                  localStorage.removeItem(STORAGE.token);
                  localStorage.removeItem(STORAGE.refreshToken);
                  localStorage.removeItem(STORAGE.user);
                  window.location.href = ROUTES.login;
                  observer.error(err);
                });
            });
          }

          // A refresh is already in progress — queue this request
          return new Observable((observer) => {
            pendingRequests.push(() => {
              const subscriber = {
                next: observer.next.bind(observer),
                error: observer.error.bind(observer),
                complete: observer.complete.bind(observer),
              };
              forward(operation).subscribe(subscriber);
            });
          });
        }
      }
    }
  },
);

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
    mutate: {
      errorPolicy: "all",
    },
    query: {
      errorPolicy: "all",
    },
  },
});
