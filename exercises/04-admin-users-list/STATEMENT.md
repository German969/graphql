# Exercise 4: Admin Users List with Filter

**Lessons:** 5 (Types and relations), 8 (Arguments on queries)

## Goal

Add a users list to the Admin page with an optional filter by username.

## Requirements

### Server

1. **Resolver** `adminUsers` in `server/resolvers/admin.js`:
   - `adminUsers(_, { limit, usernameContains }, context)`
   - Return array of users from `context.db`
   - If `usernameContains` is provided, filter users by `username LIKE '%value%'`
   - If `limit` is provided, limit results (default e.g. 50)
   - Add `getAllUsers(database, limit = 50, usernameContains = null)` to `server/db.js`

2. **User shape**: `{ id, username, displayName }` (matches existing User type)

### Client

3. **Query** on Admin page:
   - Use `useQuery` with `adminUsers(limit: $limit, usernameContains: $usernameContains)`
   - Display users in a table or list (username, displayName)
   - Add a filter input (username search) that updates the query variables

## Hints

- SQLite: `WHERE username LIKE '%' || ? || '%'` for contains
- Use `useState` for filter input, pass to query variables

## Done when

All tests in `04-admin-users-list.spec.js` pass.
