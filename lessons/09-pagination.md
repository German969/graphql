# Lesson 9: Pagination

## Goal

Add **cursor-based pagination** so the client can request posts in pages (e.g. “first 5”) and load more with a “next page” cursor. This uses a **connection** type (edges + pageInfo) and a **postsConnection** query.

## Why cursor-based?

- **Offset-based** (`limit` + `offset`) is simple but has drawbacks: large offsets are slow, and if items are added or removed, pages can shift and you might see duplicates or gaps.
- **Cursor-based** (“give me the next N items after this cursor”) is stable: the cursor is usually an id or timestamp, and the server returns a stable “window” of items. It’s the pattern used by Relay and many GraphQL APIs.

Here we use the **post id** as the cursor: “after cursor X” means “posts with id &lt; X” when we order by id descending (newest first).

## Schema: connection types

In **server/schema/post.graphql** we add types for a **connection** and use them in a new query:

```graphql
type PageInfo {
  hasNextPage: Boolean!
  endCursor: String
}

type PostEdge {
  node: Post!
  cursor: String!
}

type PostConnection {
  edges: [PostEdge!]!
  pageInfo: PageInfo!
}

extend type Query {
  posts(limit: Int): [Post!]!
  post(id: ID!): Post
  postsConnection(first: Int = 10, after: String): PostConnection!
}
```

- **PostConnection** – Wraps a list of posts with pagination metadata. Each item is a **PostEdge** (node + cursor).
- **PageInfo** – Tells the client whether there is a next page and the cursor to request it (**endCursor**).
- **postsConnection(first, after)** – Returns one “page”: up to **first** items after **after** (optional cursor). Default **first: 10**.

We keep **posts(limit)** so existing clients that only need a simple list still work.

## Resolver and database

- **Resolver** (**server/resolvers/post.js**): **postsConnection(_, { first, after })** calls **getPostsConnection(first, after)** from the db layer.
- **Database** (**server/db.js**): **getPostsConnection(first, after)**:
  - Fetches **first + 1** rows (ordered by id DESC, optionally `WHERE id < after`).
  - If we get more than **first** rows, **hasNextPage** is true and **endCursor** is the id of the last item we return (the last of the **first** rows).
  - Returns **{ edges: [ { node, cursor } ], pageInfo: { hasNextPage, endCursor } }**.

So the client gets a list of **edges** (each with **node** = post and **cursor** = id) and **pageInfo** to request the next page with **after: pageInfo.endCursor**.

## Client: query and “Load more”

The client uses **postsConnection** with variables and merges pages with Apollo’s **relayStylePagination**:

1. **Cache** (**client/src/main.jsx**): **InMemoryCache** with **typePolicies.Query.fields.postsConnection = relayStylePagination()**. This makes **fetchMore** append the next page’s edges to the same list and update **pageInfo**.
2. **Query** (**client/src/App.jsx**): **BlogQuery** asks for **postsConnection(first: $first, after: $after)** and selects **edges { node { id title body ... } }** and **pageInfo { hasNextPage endCursor }**.
3. **Variables**: Initial load uses **{ first: 5 }** (or 10). “Load more” calls **fetchMore({ variables: { after: pageInfo.endCursor, first: 5 } })**, and the cache merges the result so the UI shows all loaded posts and updated **hasNextPage** / **endCursor**.

So: first request returns the first page; when the user clicks “Load more”, we send the same query with **after** set to the previous **endCursor**; Apollo merges the new edges into **postsConnection** and the list grows with a single “Load more” button.

## Summary

| Concept | Role |
|--------|------|
| **Cursor-based pagination** | Client requests “first N items after cursor”; stable and efficient. |
| **Connection** | Type that wraps a list in **edges** (node + cursor) and **pageInfo** (hasNextPage, endCursor). |
| **postsConnection(first, after)** | Query that returns one page; **endCursor** is used as **after** for the next page. |
| **relayStylePagination()** | Apollo cache policy that merges **fetchMore** results into the same connection list. |

Next steps could be **filtering** (e.g. by author), **ordering** (e.g. by date), or **subscriptions** for real-time updates.
