# Lesson 1: Schema and Resolvers

## What is GraphQL?

GraphQL is a **query language for your API** and a runtime that executes those queries. Unlike REST, the client specifies exactly which fields it wants, and the server returns only that shape—no over-fetching or under-fetching.

## Core concepts in this lesson

1. **Schema** – The contract. It defines the *types* and the *entry points* (e.g. `Query` for reading).
2. **Resolvers** – The implementation. Each field in the schema is backed by a function that returns the value.

## Our example: a small blog API

We use a **blog** domain so names are clear and real-world:

- **`blogName`** – Name of the blog (e.g. for the header).
- **`serverTime`** – Current time on the server (useful for “last updated”).
- **`posts`** – List of blog posts (each can have an **`author`**).
- **`user(username)`** – Look up a user by username.
- **`createUser`** – Mutation to create or update a user (username + display name).
- **`publishPost`** – Mutation to create a post (you pass **`authorUsername`** so the post is linked to a user).

Each **post** has: `id`, `title`, `body`, `publishedAt`, and optionally **`author`** (a **`User`**). Each **user** has: `id`, `username`, `displayName`.

## Our first schema

The schema lives in **`server/schema.graphql`** as a `.graphql` file (Schema Definition Language, SDL). The server loads it in `server/schema.js` so there’s a single source of truth:

```graphql
type User {
  id: ID!
  username: String!
  displayName: String!
}

type Post {
  id: ID!
  title: String!
  body: String!
  publishedAt: String!
  author: User
}

type Query {
  blogName: String
  serverTime: String
  posts: [Post!]!
  user(username: String!): User
}

type Mutation {
  createUser(username: String!, displayName: String!): User!
  publishPost(title: String!, body: String!, authorUsername: String!): Post!
}
```

- **`Query`** is the root type for *read* operations. Every GraphQL API has a `Query` type (and optionally `Mutation`, `Subscription`).
- **`User`** and **`Post`** are custom types. **`Post.author`** is a *relation*: it’s of type `User` (or null for old posts). That’s how you model “each post has an optional author” in the schema.
- **`blogName`**, **`serverTime`**, **`posts`**, and **`user(username)`** are fields on `Query`. **`Mutation`** is the root type for *write* operations (Lesson 3).
- The `!` means “non-null”; `[Post!]!` means “non-null list of non-null posts”. No `!` on **`author`** means it can be null.

So we’re saying: “Clients can ask for blog info, posts (with author), and a user by username; and they can create users and publish posts linked to an author.”

## Schema file and the GraphQL extension

- **`server/schema.graphql`** – Edit the schema here. `server/schema.js` reads this file and passes it to `buildSchema()`.
- **`.graphqlrc.yml`** – Tells the GraphQL editor extension where the schema and operation documents live. With this, you get validation and autocomplete for queries/mutations in `client/src` (e.g. in your React components). Reload the editor window if the extension doesn’t pick it up.

## Resolvers (root value)

In `server/resolvers.js` we provide the logic:

- For the **root** `Query` and `Mutation` types, we pass a **root value** object whose keys match the field names.
- Each value is a function that returns the field’s value. For mutations, the function receives the **arguments** (e.g. `title`, `body`) as the first parameter.

So when a client asks for `blogName`, GraphQL calls `rootValue.blogName()` and returns the result. When they call `publishPost(title: "Hi", body: "...")`, GraphQL calls `rootValue.publishPost({ title, body })`.

## Where the data lives: SQLite

Posts and users are persisted in a **SQLite** database so they survive server restarts. The file `server/blog.db` is created on first run. In code:

- **`server/db.js`** – Opens the database, creates **`users`** and **`posts`** tables (posts have an optional `author_id`), and exports `createUser`, `getUserByUsername`, `getAllPosts()` (with author joined), and `insertPost(title, body, authorId)`. Resolvers call these instead of using in-memory state.
- **`server/blog.db`** – The SQLite file (ignored by git via `.gitignore`).

## Running a query

Start the server:

```bash
cd server && npm install && npm run dev
```

Open **http://localhost:4000/graphql** (GraphiQL). Try:

```graphql
query {
  blogName
  serverTime
  posts {
    id
    title
    body
    publishedAt
  }
}
```

You’ll get something like:

```json
{
  "data": {
    "blogName": "Learn GraphQL Blog",
    "serverTime": "2025-03-07T...",
    "posts": []
  }
}
```

## Takeaways

| Concept    | Role |
|-----------|------|
| **Schema** | Defines types and what can be queried (the “what”). Lives in `server/schema.graphql`. |
| **Resolvers** | Implement each field (the “how”). In `server/resolvers.js`. |
| **Query** | Root type for read-only operations. |
| **Custom types** | e.g. `Post` – shape the data your API returns. |
| **GraphiQL** | Built-in UI to run queries against `/graphql`. |
| **`.graphqlrc.yml`** | Config for the GraphQL extension: schema + documents for validation and autocomplete. |
| **SQLite / `server/db.js`** | **`users`** and **`posts`** (with **`author_id`**) in `server/blog.db`; resolvers use `createUser`, `getUserByUsername`, `getAllPosts()`, `insertPost()`. |

Next: **Lesson 2** – Add a React app and run this same query from the client.
