# Lesson 4: Variables and Fragments

## Variables (refresher and rules)

Variables let the client pass values into the query or mutation without string concatenation. That keeps the query static, helps with caching, and avoids injection.

### Declare in the operation

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

- **`$title`**, **`$body`** – Variable names (always prefixed with `$` in GraphQL).
- **`String!`** – Type of each variable (required here).

### Pass in the request

```json
{
  "query": "mutation PublishPost($title: String!, $body: String!) { ... }",
  "variables": { "title": "My post", "body": "Content here." }
}
```

### Default values

You can give a variable a default so the client can omit it:

```graphql
query BlogQuery($limit: Int = 10) {
  blogName
  posts(limit: $limit) { id title body publishedAt }
}
```

(Our current schema doesn’t have a `limit` argument on `posts`; this is just for the syntax.)

### Variable types must match

- If the variable is `String!`, you must pass a string.
- If the variable is `Int`, you can pass a number or omit it (if there’s a default).
- Nullable types (e.g. `String` without `!`) can be `null`.

---

## Fragments

**Fragments** are named sets of fields that you can reuse in multiple queries or in the same query.

### Why use them?

- Avoid repeating the same field list in several places (e.g. post fields in a list and in a detail view).
- When you add or remove a field on `Post`, you change it in one place.
- They’re the building block for more advanced patterns (e.g. colocating UI and data).

### Syntax

Define a fragment on a type. Our API has a **`Post`** type, so we can write:

```graphql
fragment PostFields on Post {
  id
  title
  body
  publishedAt
}
```

Use it with `...FragmentName`:

```graphql
query BlogQuery {
  blogName
  posts {
    ...PostFields
  }
}
```

The type you use the fragment on must match the type the fragment is declared on (here, `Post`). So `posts` returns `[Post!]!`, and each element is a `Post`, so `...PostFields` is valid.

### Full example with our schema

```graphql
fragment PostFields on Post {
  id
  title
  body
  publishedAt
}

query BlogQuery {
  blogName
  serverTime
  posts {
    ...PostFields
  }
}

mutation PublishPost($title: String!, $body: String!) {
  publishPost(title: $title, body: $body) {
    ...PostFields
  }
}
```

Now any change to “what a post looks like” is in one fragment.

### Inline fragments (for interfaces/unions)

When you have interfaces or unions, you use **inline fragments** to ask for type-specific fields:

```graphql
query {
  node(id: "1") {
    ... on User {
      name
      email
    }
    ... on Post {
      title
      body
    }
  }
}
```

We’ll use these when we introduce interfaces and unions in a later lesson.

## Summary

| Concept | Role |
|--------|------|
| **Variables** | `$name: Type` in the operation; pass values in `variables`; keep query static and type-safe. |
| **Defaults** | `$limit: Int = 10` lets the client omit the variable. |
| **Fragments** | Named `fragment X on Type { fields }`; reuse with `...X` (e.g. `PostFields` on `Post`). |
| **Inline fragments** | `... on ConcreteType { fields }` for interfaces/unions. |

You’ve now seen the core request shape: **queries**, **mutations**, **variables**, and **fragments** with a real-world blog example. Next steps could be: arguments on queries (e.g. `post(id: ID!)`), or error handling and validation (Lesson 6).
