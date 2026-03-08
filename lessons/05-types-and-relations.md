# Lesson 5: Multiple Types and Relations

## Goal

See how GraphQL schemas organize **multiple types** and **relations** between them (e.g. `Post` has an **`author`** of type `User`). The same ideas apply to any API with related entities.

## Organizing the schema: types first, then entry points

The schema is split in **`server/schema/`** (see Lesson 1):

1. **Types** – **`user.graphql`** defines **`User`**; **`post.graphql`** defines **`Post`**.
2. **Relations** – **`Post.author`** is of type **`User`** (or `null`), defined in **`post.graphql`**.
3. **Query** – **`base.graphql`** has `blogName`, `serverTime`; **`user.graphql`** and **`post.graphql`** use **`extend type Query`** to add `user(username)` and `posts`.
4. **Mutation** – **`user.graphql`** defines **`type Mutation { createUser(...) }`**; **`post.graphql`** uses **`extend type Mutation`** to add **`publishPost(...)`**.

Splitting by domain keeps the schema readable as the app grows.

## User and Post

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
```

- **`User`** – A single entity: id, username, display name.
- **`Post`** – Has its own fields plus **`author: User`**. So each post can have an author (or `null` for legacy posts). That’s a **relation**: one post → one user.

The schema doesn’t say *how* the server gets the author; it only says “a post can have an author of type User.” The resolvers (and the DB) do the join.

## Query and Mutation entry points

These entry points are spread across **`server/schema/base.graphql`**, **`user.graphql`**, and **`post.graphql`** (with **`extend type Query`** / **`extend type Mutation`**):

- **`posts`** – In **`post.graphql`**. Returns a list of **`Post`**; each post can include **`author`** if the client asks for it.
- **`user(username)`** – Returns one **`User`** by username (or null). Useful to look up a user or check they exist before publishing.
- **`createUser`** – Creates or updates a user; returns **`User`**.
- **`publishPost(..., authorUsername)`** – Creates a **`Post`** and links it to the **`User`** with that username.

So we have two **models** (User, Post) and one **relation** (Post → author → User). The client can ask for posts and include `author { username displayName }` in the same query.

## How the client uses it

- **Current user** – The frontend stores “current user” (username + display name) in state and `localStorage`. No login: you just type a username and display name and click “Set as current user” (which calls **`createUser`**).
- **Publishing** – When you publish a post, the client sends **`authorUsername`** (the current user’s username). The server looks up that user and sets **`author_id`** on the new post.
- **Listing posts** – The query asks for **`posts { ... author { displayName } }`** so each post shows “by **Display Name**” in the UI.

## Database and resolvers

- **DB** – **`server/db.js`**: **`users`** table (id, username, display_name). **`posts`** table has **`author_id`** referencing **`users(id)`**. Old posts can have **`author_id`** null.
- **Resolvers** – **`server/resolvers/post.js`**: **`posts`** calls **`getAllPosts()`**, which joins posts and users so each post has an **`author`** object (or null). **`publishPost`** receives **`authorUsername`**, finds the user via **`getUserByUsername`**, then calls **`insertPost(title, body, author.id)`**.

## Takeaways

| Concept | Role |
|--------|------|
| **Multiple types** | Define each entity (User, Post) as its own type in the schema. |
| **Relations** | A field on a type can return another type (e.g. **`Post.author`** → **`User`**). |
| **Entry points** | **Query** and **Mutation** define what the client can call; they return your types. |
| **Naming** | Use clear, domain names: **`authorUsername`**, **`createUser`**, **`displayName`** so the schema stays easy to read. |
| **Split schema** | **`server/schema/`** (base, user, post) and **`server/resolvers/`** (blog, user, post) keep user and post logic separate. |

Next steps could be: **arguments on Query** (e.g. **`post(id: ID!)`**), **pagination** for **`posts`**, or **validation and errors** (Lesson 6).
