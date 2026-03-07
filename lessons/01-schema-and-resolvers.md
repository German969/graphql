# Lesson 1: Schema and Resolvers

## What is GraphQL?

GraphQL is a **query language for your API** and a runtime that executes those queries. Unlike REST, the client specifies exactly which fields it wants, and the server returns only that shape—no over-fetching or under-fetching.

## Core concepts in this lesson

1. **Schema** – The contract. It defines the *types* and the *entry points* (e.g. `Query` for reading).
2. **Resolvers** – The implementation. Each field in the schema is backed by a function that returns the value.

## Our first schema

In `server/schema.js` we use the GraphQL schema definition language (SDL):

```graphql
type Query {
  hello: String
  now: String
}
```

- **`Query`** is the root type for *read* operations. Every GraphQL API has a `Query` type (and optionally `Mutation`, `Subscription`).
- **`hello`** and **`now`** are *fields* on `Query`. Both return a `String`.

So we’re saying: “Clients can ask for `hello` and/or `now`, and they’ll get strings back.”

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
| **Schema** | Defines types and what can be queried (the “what”). |
| **Resolvers** | Implement each field (the “how”). |
| **Query** | Root type for read-only operations. |
| **GraphiQL** | Built-in UI to run queries against `/graphql`. |

Next: **Lesson 2** – Add a React app and run this same query from the client.
