# Lesson 4: Variables and Fragments

## Variables (refresher and rules)

Variables let the client pass values into the query or mutation without string concatenation. That keeps the query static, helps with caching, and avoids injection.

### Declare in the operation

```graphql
mutation AddMessage($text: String!) {
  addMessage(text: $text)
}
```

- **`$text`** – Variable name (always prefixed with `$` in GraphQL).
- **`String!`** – Type of the variable (required here).

### Pass in the request

```json
{
  "query": "mutation AddMessage($text: String!) { addMessage(text: $text) }",
  "variables": { "text": "My message" }
}
```

### Default values

You can give a variable a default so the client can omit it:

```graphql
query GetMessages($limit: Int = 10) {
  messages(limit: $limit)
}
```

(Our current schema doesn’t have `limit` on `messages`; this is just for the syntax.)

### Variable types must match

- If the variable is `String!`, you must pass a string.
- If the variable is `Int`, you can pass a number or omit it (if there’s a default).
- Nullable types (e.g. `String` without `!`) can be `null`.

---

## Fragments

**Fragments** are named sets of fields that you can reuse in multiple queries or in the same query.

### Why use them?

- Avoid repeating the same field list in several places.
- When you add or remove a field, you change it in one place.
- They’re the building block for more advanced patterns (e.g. colocating UI and data).

### Syntax

Define a fragment on a type:

```graphql
fragment MessageFields on Message {
  id
  text
  createdAt
}
```

Use it with `...FragmentName`:

```graphql
query {
  messages {
    ...MessageFields
  }
}
```

The type you use the fragment on must match the type the fragment is declared on (here, `Message`). Our current API only has `messages: [String!]!`, so we don’t have a `Message` type yet. Once we add a type like:

```graphql
type Message {
  id: ID!
  text: String!
  createdAt: String!
}
type Query {
  messages: [Message!]!
}
```

then we could write:

```graphql
fragment MessageFields on Message {
  id
  text
  createdAt
}

query {
  messages {
    ...MessageFields
  }
}
```

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
| **Fragments** | Named `fragment X on Type { fields }`; reuse with `...X`. |
| **Inline fragments** | `... on ConcreteType { fields }` for interfaces/unions. |

You’ve now seen the core request shape: **queries**, **mutations**, **variables**, and **fragments**. Next steps could be: custom types and relations (Lesson 5), or error handling and validation (Lesson 6).
