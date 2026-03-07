import { buildSchema } from 'graphql';

/**
 * Schema is the contract: what clients can ask for.
 * We define types and the entry points (Query for reads).
 */
export const schema = buildSchema(`
  type Query {
    hello: String
    now: String
    messages: [String!]!
  }

  type Mutation {
    addMessage(text: String!): String!
  }
`);
