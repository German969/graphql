# Exercise 2: Admin Stats Query

**Lessons:** 1 (Schema), 2 (First query), 6 (Apollo Client)

## Goal

Add an `adminStats` query that returns user and post counts, and display them on the Admin page.

## Requirements

### Server

1. **Schema** (already in `server/schema/admin.graphql`):
   - `adminStats: AdminStats!` on Query
   - `AdminStats { userCount: Int!, postCount: Int! }`

2. **Resolver** in `server/resolvers/admin.js`:
   - Implement `adminStats(_, __, context)` to return `{ userCount, postCount }`
   - Use `context.db` to count rows in `users` and `posts` tables
   - Add `getUserCount(database)` and `getPostCount(database)` to `server/db.js` if needed

### Client

3. **Query** in Admin page:
   - Use `useQuery` with `gql` to fetch `adminStats { userCount postCount }`
   - Display the numbers on the Admin page (e.g. "Users: X | Posts: Y")

## Hints

- SQLite: `SELECT COUNT(*) FROM users` and `SELECT COUNT(*) FROM posts`
- Handle loading and error states in the client

## Done when

All tests in `02-admin-stats.spec.js` pass.
