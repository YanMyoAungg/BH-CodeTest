export const authTypeDefs = `#graphql
  type User {
    id: ID!
    username: String!
  }

  type AuthPayload {
    accessToken: String!
    refreshToken: String!
    user: User!
  }

  type Mutation {
    login(username: String!, password: String!): AuthPayload!
    refreshToken(token: String!): AuthPayload!
  }
`;
