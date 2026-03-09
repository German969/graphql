# Lesson 8: Arguments on Queries

## Goal

Use **arguments** on query fields so the client can pass values (e.g. an id to fetch one post, or a limit to cap the list). You already have `**user(username: String!)`**; here we add `**post(id: ID!)**` and `**posts(limit: Int)**` to see required vs optional arguments.

## Why arguments?

Arguments let one field serve many cases:

- `**posts**` – “Give me all posts” or “Give me the latest 5” with `**posts(limit: 5)**`.
- `**post(id: ID!)**` – “Give me this specific post” by id.

Without arguments you’d need separate fields (e.g. `recentPosts` and `allPosts`). With arguments, the schema stays small and flexible.

## Schema: required vs optional

In `**server/schema/post.graphql**` we have:

```graphql
extend type Query {
  posts(limit: Int): [Post!]!
  post(id: ID!): Post
}
```

- `**posts(limit: Int)**` – **Optional** argument: no `!`, so the client can omit it and get all posts, or pass `**limit: 5`** to get at most 5.
- `**post(id: ID!)**` – **Required** argument: `**ID!`** means the client must pass `**id**`. The return type `**Post**` (no `!`) means “one post or null” (e.g. not found).

So:

- **Required** = type has `**!`** (e.g. `**id: ID!**`).
- **Optional** = type has no `**!`** (e.g. `**limit: Int**`); the client can omit it and the resolver receives `**undefined**`.

## Resolvers: reading arguments

Apollo resolvers are `**(parent, args, context, info)**`. For `**post**` and `**posts**` we only need **args**:

```js
// server/resolvers/post.js
posts(_, { limit }) {
  return getAllPosts(limit);  // limit can be undefined
}
post(_, { id }) {
  return getPostById(id) ?? null;
}
```

- `**posts(_, { limit })**` – When the client omits **limit**, **args.limit** is **undefined** and we return all posts. When they pass **limit: 5**, we pass **5** to **getAllPosts(limit)**.
- `**post(_, { id })`** – The client must send **id**; we look up the post and return **null** if not found.

## Database layer

- `**getPostById(id)`** – In `**server/db.js**`: selects one row by **id**, joins **users** for **author**, returns a post object or **null**.
- `**getAllPosts(limit)`** – Optional **limit**; when **limit** is a positive integer we add **LIMIT ?** to the SQL, otherwise we return all.

## Calling from the client

**Single post by id:**

```graphql
query GetPost($id: ID!) {
  post(id: $id) {
    id
    title
    body
    publishedAt
    author { id username displayName }
  }
}
```

Variables: `**{ "id": "1" }**`.

**Posts with optional limit:**

```graphql
query GetPosts($limit: Int) {
  posts(limit: $limit) {
    id
    title
    body
    publishedAt
    author { id username displayName }
  }
}
```

- `**posts**` – no variables, or `**{}**` → all posts.
- `**posts(limit: 5)**` – variables `**{ "limit": 5 }**` → at most 5 posts.

With Apollo Client you’d use `**useQuery(GET_POST, { variables: { id: selectedId } })**` or `**useQuery(GET_POSTS, { variables: { limit: 5 } })**`.

## Summary


| Concept                 | Role                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| **Arguments on fields** | Let the client pass values; defined in the schema as **field(arg: Type): ReturnType**.     |
| **Required**            | `**Type!`** (e.g. `**id: ID!**`); client must pass the argument.                           |
| **Optional**            | `**Type`** without `**!**` (e.g. `**limit: Int**`); resolver may receive **undefined**.    |
| **Resolvers**           | Second parameter **args** holds the argument values; use **args.id**, **args.limit**, etc. |


Next steps could be: **pagination** (cursor- or offset-based), **filtering** (e.g. **posts(authorUsername: String)**), or **error handling** (e.g. not found).