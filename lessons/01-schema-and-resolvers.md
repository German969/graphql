# Lesson 1: Schema and Resolvers

## What is GraphQL?

GraphQL is a **query language for your API** and a runtime that executes those queries. Unlike REST, the client specifies exactly which fields it wants, and the server returns only that shape—no over-fetching or under-fetching.

## Core concepts in this lesson

1. **Schema** – The contract. It defines the *types* and the *entry points* (e.g. `Query` for reading).
2. **Resolvers** – The implementation. Each field in the schema is backed by a function that returns the value.

## Our first schema

The schema lives in **`server/schema.graphql`** as a `.graphql` file (Schema Definition Language, SDL). The server loads it in `server/schema.js` so there’s a single source of truth. A minimal version looks like:

```graphql
type Query {
  hello: String
  now: String
  messages: [String!]!
}

type Mutation {
  addMessage(text: String!): String!
}
```

- **`Query`** is the root type for *read* operations. Every GraphQL API has a `Query` type (and optionally `Mutation`, `Subscription`).
- **`hello`**, **`now`**, and **`messages`** are *fields* on `Query`. **`Mutation`** is the root type for *write* operations (we use it in Lesson 3).

So we’re saying: “Clients can ask for these fields and get back the declared types.”

## Schema file and the GraphQL extension

- **`server/schema.graphql`** – Edit the schema here. `server/schema.js` reads this file and passes it to `buildSchema()`.
- **`.graphqlrc.yml`** – Tells the GraphQL editor extension where the schema and operation documents live. With this, you get validation and autocomplete for queries/mutations in `client/src` (e.g. in your React components). Reload the editor window if the extension doesn’t pick it up.

## Resolvers (root value)

In `server/resolvers.js` we provide the logic:

- For the **root** `Query` type, we pass a **root value** object whose keys match the field names.
- Each value is a function that returns the field’s value.

So when a client asks for `hello`, GraphQL calls `rootValue.hello()` and returns the result.

## Running a query

Start the server:

```bash
cd server && npm install && npm run dev
```

Open **http://localhost:4000/graphql** (GraphiQL). Try:

```graphql
query {
  hello
  now
}
```

You’ll get something like:

```json
{
  "data": {
    "hello": "Hello, GraphQL!",
    "now": "2025-03-07T..."
  }
}
```

## Takeaways

| Concept    | Role |
|-----------|------|
| **Schema** | Defines types and what can be queried (the “what”). Lives in `server/schema.graphql`. |
| **Resolvers** | Implement each field (the “how”). In `server/resolvers.js`. |
| **Query** | Root type for read-only operations. |
| **GraphiQL** | Built-in UI to run queries against `/graphql`. |
| **`.graphqlrc.yml`** | Config for the GraphQL extension: schema + documents for validation and autocomplete. |

Next: **Lesson 2** – Add a React app and run this same query from the client.
