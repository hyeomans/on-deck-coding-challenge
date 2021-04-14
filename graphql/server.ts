import {ApolloServer, gql} from 'apollo-server-micro'
import * as resolvers from './resolvers'

const typeDefs = gql`
  type Project {
    id: Int!
    name: String!
    description: String!
    icon_url: String!
    users: [User!]!
  }

  type User {
    id: Int!
    name: String!
    bio: String!
    avatar_url: String!
    fellowship: String!
    projects: [Project!]!
  }

  type Feed {
    id: Int!
    name: String!
    desc: String!
    created_ts: String!
    type: String!
    avatar_url: String!
  }

  type PageInfo {
    hasMore: Boolean
    next: String
  }

  type Response {
    edges: [Feed]
    pageInfo: PageInfo
  }

  type Query {
    project(id: Int!): Project!
    user(id: Int!): User!
    feed(cursor: String, userType: String): Response
  }
`;

export const server = new ApolloServer({typeDefs, resolvers})
