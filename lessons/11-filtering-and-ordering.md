# Lesson 11: Filtering and Ordering

## Goal

Add **filtering** (e.g. posts by author) and **ordering** (newest, oldest, title A–Z, Z–A) to the posts queries. The client can pass these as arguments and the server applies them before returning results.

## Why filter and order?

- **Filtering** – “Show only posts by @alice” reduces the result set and lets users focus on specific authors.
- **Ordering** – “Newest first” vs “Title A–Z” changes how the list is sorted. Different use cases need different orders.

Combined with pagination, filter and order arguments make one field flexible: `postsConnection(first, after, authorUsername, orderBy)` serves many UI needs.

## Schema: enum and arguments

In **server/schema/post.graphql** we add an enum for ordering and extend the query arguments:

```graphql
enum PostOrderBy {
  PUBLISHED_AT_DESC
  PUBLISHED_AT_ASC
  TITLE_ASC
  TITLE_DESC
}

extend type Query {
  posts(limit: Int, authorUsername: String, orderBy: PostOrderBy): [Post!]!
  postsConnection(first: Int = 10, after: String, authorUsername: String, orderBy: PostOrderBy): PostConnection!
}
```

- **authorUsername** – Optional string. When provided, only posts by that author are returned. Omit for all posts.
- **orderBy** – Optional enum. Default is `PUBLISHED_AT_DESC` (newest first). Other values: oldest first, title A–Z, title Z–A.

## Database layer

- **getAllPosts(limit, authorUsername, orderBy)** – Adds a `WHERE u.username = ?` when **authorUsername** is set (join with users). Uses an **ORDER BY** clause from a map keyed by **orderBy** (e.g. `ORDER BY p.id DESC`, `ORDER BY p.title ASC, p.id ASC`).
- **getPostsConnection(first, after, authorUsername, orderBy)** – Same filter and order. Cursor logic depends on the sort:
  - For **PUBLISHED_AT_DESC** / **PUBLISHED_AT_ASC**: cursor is the post id; “after” means `id < cursor` or `id > cursor`.
  - For **TITLE_ASC** / **TITLE_DESC**: cursor encodes `(title, id)` (e.g. base64 JSON) so we can build `WHERE (title > ? OR (title = ? AND id > ?))` for stable pagination.

The `id` is always included in the sort (e.g. `ORDER BY title ASC, id ASC`) so ordering is deterministic when titles repeat.

## Resolvers

Pass the new arguments through to the db:

```js
posts(_, { limit, authorUsername, orderBy }) {
  return getAllPosts(limit ?? undefined, authorUsername ?? undefined, orderBy ?? 'PUBLISHED_AT_DESC');
}
postsConnection(_, { first, after, authorUsername, orderBy }) {
  return getPostsConnection(first ?? 10, after ?? undefined, authorUsername ?? undefined, orderBy ?? 'PUBLISHED_AT_DESC');
}
```

## Client: filter and order UI

- Add state for **authorFilter** (string) and **orderBy** (enum value).
- Pass them as query variables: `authorUsername: authorFilter.trim() || null`, `orderBy`.
- When filter or order changes, the query variables change and Apollo refetches.
- For **fetchMore**, pass the same **authorUsername** and **orderBy** so the next page uses the same filter and order.
- **relayStylePagination** – Use `keyArgs: ['first', 'after', 'authorUsername', 'orderBy']` so different filter/order combinations are cached separately and don’t merge incorrectly.

## Summary

| Concept | Role |
|--------|------|
| **Filter argument** | Optional `authorUsername` narrows results to one author. |
| **Order argument** | Optional `orderBy` enum controls sort (newest, oldest, title A–Z, Z–A). |
| **Cursor with custom order** | For title-based sorts, cursor encodes `(title, id)` for stable “next page” queries. |
| **Cache keyArgs** | Include filter and order in pagination keyArgs so each combination has its own cache entry. |

Next steps could be **search** (full-text on title/body), **subscriptions** for real-time updates, or **authentication**.
