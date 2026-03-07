# Lesson 3: Mutations

## What is a mutation?

In GraphQL, **queries** are for reading data; **mutations** are for changing data (create, update, delete). By convention they’re defined on a root type called `Mutation`.

## Schema: adding Mutation

We extended the schema with:

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

- **`[String!]!`** – List of non-null strings; the list itself is non-null. So `messages` always returns an array (possibly empty).
- **`addMessage(text: String!)`** – Takes one argument, `text`, required (non-null). Returns the added string.

## Resolvers for Mutation

Mutations are resolved like queries: the resolver lives on the same root value object. The second argument to a resolver is **arguments** (the ones defined in the schema):

```js
addMessage({ text }) {
  messages.push(text);
  return text;
}
```

So when the client sends `addMessage(text: "Hi")`, GraphQL calls this with `{ text: "Hi" }`.

## Calling a mutation from the client

In the client we send a **mutation** operation and pass **variables** so the query string stays static:

```graphql
mutation AddMessage($text: String!) {
  addMessage(text: $text)
}
```

And in the request body:

```json
{
  "query": "mutation AddMessage($text: String!) { addMessage(text: $text) }",
  "variables": { "text": "Hello world" }
}
```

Our `graphql()` helper already accepts `(query, variables)`, so we call:

```js
await graphql(
  `mutation AddMessage($text: String!) { addMessage(text: $text) }`,
  { text: newText.trim() }
);
```

## Naming the operation

`AddMessage` is an **operation name**. It’s optional but useful for logging and debugging. Syntax:

```graphql
mutation AddMessage($text: String!) { ... }
```

## Takeaways

| Concept | Role |
|--------|------|
| **Mutation** | Root type for operations that change data. |
| **Arguments** | Fields can take arguments; resolvers receive them as the second parameter. |
| **Variables** | Client passes `variables` in the request; the query uses `$name: Type` and references `$name`. |
| **Lists in schema** | `[String!]!` = non-null list of non-null strings. |

Next: **Lesson 4** – Variables and fragments in more detail.
