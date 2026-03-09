# Exercise 5: Paginated Posts Audit

**Lessons:** 9 (Pagination)

## Goal

Add a paginated posts list to the Admin page using the existing `postsConnection` query.

## Requirements

1. **Query** on Admin page:
   - Use `postsConnection(first: $first, after: $after, orderBy: $orderBy)` (existing query)
   - Use `relayStylePagination` or manual `fetchMore` for loading the next page

2. **Display**:
   - Show posts in a table or list: title, author (username), publishedAt
   - "Load more" button that fetches the next page using `endCursor`

3. **Pagination**:
   - Use `pageInfo { hasNextPage, endCursor }` to know when more is available

## Hints

- Reuse `BLOG_QUERY` structure or create `ADMIN_POSTS_QUERY` with postsConnection
- `fetchMore({ variables: { after: pageInfo.endCursor, first: 10 } })`
- Add `postsConnection` to Apollo cache typePolicies if needed for pagination merge

## Done when

All tests in `05-admin-posts-audit.spec.js` pass.
