# Lesson 16: Apollo vs Relay

## Goal

Understand the **conceptual and practical differences** between **Apollo** and **Relay**—two major GraphQL ecosystems. Both provide client libraries and server tooling, but they differ in philosophy, schema requirements, and developer experience.

## What are they?

- **Apollo** – A flexible GraphQL platform: Apollo Client (React, iOS, Android, etc.), Apollo Server, and tooling. Works with any GraphQL API. Widely used, beginner-friendly.
- **Relay** – A GraphQL client (and spec) from Meta/Facebook. Opinionated, optimized for large apps. Enforces schema conventions and uses a compiler.

## Philosophy

| Aspect | Apollo | Relay |
|--------|--------|-------|
| **Approach** | Flexible, unopinionated | Opinionated, convention-driven |
| **Schema** | Works with any GraphQL schema | Expects Relay-compliant schema (connections, node interface, etc.) |
| **Learning curve** | Gentler | Steeper |
| **Best for** | Teams new to GraphQL, varied schemas | Large teams, consistency, performance at scale |

## Schema: Relay’s requirements

Relay defines a **GraphQL Server Specification** that servers should follow. Apollo works with any schema.

### 1. Global object identification (Node interface)

Relay expects a root field `node(id: ID!): Node` so any object can be fetched by id:

```graphql
# Relay expects
interface Node {
  id: ID!
}
type Query {
  node(id: ID!) : Node
}

# Apollo: optional, you define what you need
type Query {
  post(id: ID!): Post
  user(username: String!): User
}
```

### 2. Connection specification (pagination)

Relay’s **Cursor Connections** spec defines a standard shape for paginated lists:

```graphql
# Relay connection (required shape)
type PostConnection {
  edges: [PostEdge!]!
  pageInfo: PageInfo!
}
type PostEdge {
  node: Post!
  cursor: String!
}
type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

# Query
posts(first: Int!, after: String): PostConnection!
```

Apollo’s **relayStylePagination** supports this shape but does not require it. You can use `posts(limit: Int, offset: Int): [Post!]!` or any other pattern.

### 3. Mutations: client mutation IDs

Relay’s mutation spec includes `clientMutationId` for correlating requests and responses. Apollo does not require this.

## Client: queries and fragments

### Apollo

- Write operations with `gql` or `graphql()`.
- Queries live in components or shared files.
- No compiler step; operations are sent as-is.

```js
// Apollo: plain GraphQL
const POSTS_QUERY = gql`
  query Posts($first: Int, $after: String) {
    postsConnection(first: $first, after: $after) {
      edges { node { id title } }
      pageInfo { hasNextPage endCursor }
    }
  }
`;
const { data } = useQuery(POSTS_QUERY, { variables: { first: 10 } });
```

### Relay

- **Fragments** are colocated with components; each component declares the data it needs.
- **Relay Compiler** runs at build time, generates artifacts, and validates.
- Queries are composed from fragments; the compiler builds the full query.

```graphql
# Relay: fragment colocated with component
fragment PostList_posts on Query
@refetchable(queryName: "PostListRefetchQuery") {
  postsConnection(first: $count, after: $cursor)
  @connection(key: "PostList_posts") {
    edges {
      node {
        id
        ...PostItem_post
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}
```

```js
// Relay: useFragment, usePaginationFragment
const { data } = usePaginationFragment(PostList_posts, queryRef);
```

## Pagination

### Apollo

- Use `relayStylePagination()` for Relay-style connections, or implement your own.
- `fetchMore` appends the next page; you control variables and cache merging.
- No special directives.

```js
// Apollo: relayStylePagination + fetchMore
const { data, fetchMore } = useQuery(POSTS_QUERY, { variables: { first: 10 } });
fetchMore({ variables: { after: data.postsConnection.pageInfo.endCursor } });
```

### Relay

- `@connection(key: "...")` marks paginated fields.
- `usePaginationFragment` handles loading more, cursor management, and cache updates.
- Compiler ensures correct query shape.

```graphql
# Relay: @connection directive
postsConnection(first: $count, after: $cursor)
@connection(key: "PostList_posts") {
  edges { node { ... } }
  pageInfo { ... }
}
```

## Caching

Both use **normalized caches** (objects by id). Apollo’s cache is configurable via `typePolicies`; Relay’s is tuned for its data model and compiler output.

## Subscriptions

- **Apollo** – Subscriptions over WebSocket are built-in (e.g. `graphql-ws`).
- **Relay** – No built-in subscriptions; you integrate them yourself (e.g. via `@live` or custom setup).

## Setup and tooling

### Apollo

```bash
npm install @apollo/client graphql
```

- Add `ApolloProvider` and `ApolloClient`.
- No build step for GraphQL.

### Relay

```bash
npm install react-relay relay-runtime
npm install -D relay-compiler
```

- Configure Relay Compiler in `package.json` or `relay.config.js`.
- Compiler must run when queries/fragments change (e.g. `relay-compiler` in dev).

## Example: fetching a post

### Apollo

```graphql
query GetPost($id: ID!) {
  post(id: $id) {
    id
    title
    body
    author { username displayName }
  }
}
```

```js
const { data } = useQuery(GET_POST, { variables: { id } });
```

### Relay

```graphql
query GetPostQuery($id: ID!) {
  node(id: $id) {
    ...PostDetail_post
  }
}
fragment PostDetail_post on Post {
  id title body
  author { username displayName }
}
```

```js
const { data } = useLazyLoadQuery(GetPostQuery, { id });
```

Relay uses `node(id)` and the `Node` interface; the fragment specifies the fields.

## Example: paginated list

### Apollo (this project)

```graphql
query BlogQuery($first: Int, $after: String) {
  postsConnection(first: $first, after: $after) {
    edges { node { id title body } }
    pageInfo { hasNextPage endCursor }
  }
}
```

- `relayStylePagination` merges pages.
- Manual `fetchMore` with `after: endCursor`.

### Relay

```graphql
fragment PostList_query on Query
@refetchable(queryName: "PostListRefetchQuery") {
  postsConnection(first: $count, after: $cursor)
  @connection(key: "PostList_posts") {
    edges { node { id ...PostItem_post } }
    pageInfo { hasNextPage endCursor }
  }
}
```

- `usePaginationFragment` handles `loadNext`, cursor, and cache.
- Compiler generates the refetch query.

## Summary

| Topic | Apollo | Relay |
|-------|--------|-------|
| **Schema** | Any GraphQL | Relay spec (Node, connections, etc.) |
| **Fragments** | Optional, manual | Colocated, compiler-composed |
| **Compiler** | None | Required (relay-compiler) |
| **Pagination** | Manual or relayStylePagination | @connection, usePaginationFragment |
| **Subscriptions** | Built-in | Custom integration |
| **Learning curve** | Lower | Higher |
| **Flexibility** | High | Lower (conventions) |
| **Consistency** | You enforce | Enforced by tooling |

This project uses **Apollo** with a Relay-style connection (`postsConnection`) to show pagination patterns that work with both ecosystems. The schema is compatible with Relay’s connection spec, but we don’t use the Node interface or Relay compiler.
