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

## Schema and resolvers: organized by domain

Schema and resolvers are split by area so they stay easy to find as the app grows.

**Schema** (`server/schema/`):

- **`base.graphql`** – Root `Query` (blogName, serverTime).
- **`user.graphql`** – `User` type, `Query.user`, `Mutation.createUser`.
- **`post.graphql`** – `Post` type, `Query.posts`, `Mutation.publishPost`.

`server/schema.js` reads these files, concatenates them, and passes the result to `buildSchema()`. **`.graphqlrc.yml`** points the GraphQL extension at `server/schema/*.graphql` for validation and autocomplete in `client/src`.

**Resolvers** (`server/resolvers/`):

- **`blog.js`** – `blogName`, `serverTime`.
- **`user.js`** – `user`, `createUser`.
- **`post.js`** – `posts`, `publishPost`.
- **`index.js`** – Merges them into one root value with `createRootValue()`.

User-related and post-related fields live in separate schema and resolver files; the server still exposes one schema and one root value.

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
| **Schema** | Defines types and what can be queried (the “what”). Split in `server/schema/*.graphql` (base, user, post). |
| **Resolvers** | Implement each field (the “how”). Split in `server/resolvers/*.js` (blog, user, post, index). |
| **Query** | Root type for read-only operations. |
| **Custom types** | e.g. `Post` – shape the data your API returns. |
| **GraphiQL** | Built-in UI to run queries against `/graphql`. |
| **`.graphqlrc.yml`** | Config for the GraphQL extension: schema + documents for validation and autocomplete. |
| **SQLite / `server/db.js`** | **`users`** and **`posts`** (with **`author_id`**) in `server/blog.db`; resolver modules in `server/resolvers/` call the db helpers. |

Next: **Lesson 2** – Add a React app and run this same query from the client.
