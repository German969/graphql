# Lesson 3: Mutations

## What is a mutation?

In GraphQL, **queries** are for reading data; **mutations** are for changing data (create, update, delete). By convention they’re defined on a root type called `Mutation`.

In our blog API, the mutation **`publishPost`** creates a new post. The name makes it clear what it does: “publish a post,” not a generic “add” or “create.”

## Schema: the Mutation type

Our schema defines:

```graphql
type Post {
  id: ID!
  title: String!
  body: String!
  publishedAt: String!
}

type Query {
  blogName: String
  serverTime: String
  posts: [Post!]!
}

type Mutation {
  publishPost(title: String!, body: String!): Post!
}
```

- **`publishPost(title: String!, body: String!)`** – Takes two required arguments: `title` and `body`. Both are non-null strings.
- **`: Post!`** – The mutation returns a single post (the one just created), so the client can show it without refetching the full list.

## Resolvers for Mutation

Mutations are resolved like queries: the resolver lives on the same root value object. The first argument to a resolver is the **arguments** object (the ones defined in the schema). We persist posts in SQLite via `server/db.js`:

```js
import { insertPost } from './db.js';

publishPost({ title, body }) {
  return insertPost(title, body);
}
```

So when the client sends `publishPost(title: "My title", body: "My body")`, GraphQL calls this with `{ title, body }`, and we insert a row and return the created post. Data survives server restarts because it’s stored in `server/blog.db`.

## Calling a mutation from the client

In the client we send a **mutation** operation and pass **variables** so the query string stays static:

```graphql
mutation PublishPost($title: String!, $body: String!) {
  publishPost(title: $title, body: $body) {
    id
    title
    body
    publishedAt
  }
}
```

We ask for the created post’s fields so we can add it to the UI without refetching. In the request body we pass:

```json
{
  "query": "mutation PublishPost($title: String!, $body: String!) { ... }",
  "variables": { "title": "First post", "body": "Hello, world!" }
}
```

Our `graphql()` helper accepts `(query, variables)`, so we call:

```js
await graphql(
  `mutation PublishPost($title: String!, $body: String!) {
    publishPost(title: $title, body: $body) { id title body publishedAt }
  }`,
  { title: title.trim(), body: body.trim() }
);
```

## Naming the operation

`PublishPost` is an **operation name**. It’s optional but useful for logging and debugging. Syntax:

```graphql
mutation PublishPost($title: String!, $body: String!) { ... }
```

## Takeaways

| Concept | Role |
|--------|------|
| **Mutation** | Root type for operations that change data (e.g. `publishPost`). |
| **Arguments** | Fields can take arguments; resolvers receive them as the first parameter. |
| **Variables** | Client passes `variables` in the request; the query uses `$name: Type` and references `$name`. |
| **Return value** | Returning the created `Post` lets the client update the UI without an extra query. |

Next: **Lesson 4** – Variables and fragments in more detail.
