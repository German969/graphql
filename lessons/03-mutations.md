# Lesson 3: Mutations

## What is a mutation?

In GraphQL, **queries** are for reading data; **mutations** are for changing data (create, update, delete). By convention they’re defined on a root type called `Mutation`.

In our blog API we have two mutations: **`createUser`** (create or update a user by username) and **`publishPost`** (create a post linked to an author).

## Schema: the Mutation type

Our schema defines:

```graphql
type Mutation {
  createUser(username: String!, displayName: String!): User!
  publishPost(title: String!, body: String!, authorUsername: String!): Post!
}
```

- **`createUser(username, displayName)`** – Creates a user, or updates the display name if the username already exists. Returns the **`User`**.
- **`publishPost(title, body, authorUsername)`** – Creates a post. **`authorUsername`** links the post to a user (that user must exist; create them first with `createUser`). Returns the created **`Post`** (including `author`).

## Resolvers for Mutation

Mutations are resolved like queries: the resolver lives on the same root value object. We persist in SQLite via `server/db.js`:

```js
createUser({ username, displayName }) {
  return createUser(username, displayName);  // from db.js
}
publishPost({ title, body, authorUsername }) {
  const author = getUserByUsername(authorUsername);
  if (!author) throw new Error('User not found. Create the user first.');
  return insertPost(title, body, Number(author.id));
}
```

So when the client sends `publishPost(..., authorUsername: "alice")`, we look up the user and set the post’s `author_id` in the database.

## Calling mutations from the client

We send a **mutation** and pass **variables**. Example: publish a post as the current user.

```graphql
mutation PublishPost($title: String!, $body: String!, $authorUsername: String!) {
  publishPost(title: $title, body: $body, authorUsername: $authorUsername) {
    id
    title
    body
    publishedAt
    author { id username displayName }
  }
}
```

The frontend remembers the “current user” (username + display name) in state and `localStorage`, and sends `authorUsername` when publishing. No authentication—just a chosen identity for posting.

## Naming the operation

`PublishPost` and `CreateUser` are **operation names**. Optional but useful for logging and debugging.

## Takeaways

| Concept | Role |
|--------|------|
| **Mutation** | Root type for operations that change data (e.g. `publishPost`). |
| **Arguments** | Fields can take arguments; resolvers receive them as the first parameter. |
| **Variables** | Client passes `variables` in the request; the query uses `$name: Type` and references `$name`. |
| **Return value** | Returning the created `Post` lets the client update the UI without an extra query. |

Next: **Lesson 4** – Variables and fragments in more detail.
