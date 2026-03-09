# Admin Dashboard Exercises

Practice what you learned in the lessons by building an **Admin Dashboard** that manages users, audits posts, and shows analytics.

## Setup

1. **Start the server** (terminal 1):
   ```bash
   cd server && npm run dev
   ```

2. **Start the client** (terminal 2):
   ```bash
   cd client && npm run dev
   ```

3. **Run exercises** (terminal 3):
   ```bash
   npm run test:exercises
   ```

   Or run a specific exercise:
   ```bash
   npx playwright test exercises/01-admin-page
   ```

## Workflow (TDD)

1. Read the **STATEMENT** for the exercise.
2. Run the tests – they will fail.
3. Implement the feature until all tests pass.
4. Submit your solution (tests pass).
5. Get feedback and improvements.
6. Move to the next exercise.

## Exercise Order

| # | Lessons | Topic |
|---|---------|-------|
| 1 | 1, 2, 6 | Admin page + routing |
| 2 | 1, 2, 6 | Admin stats query (schema, resolver, client) |
| 3 | 3, 4 | Create user from admin (mutation, variables) |
| 4 | 5, 8 | Users list with filter |
| 5 | 9 | Paginated posts audit |
| 6 | 10 | Validation errors |
| 7 | 11 | Filter and order posts in admin |
| 8 | 12 | Admin requires auth (context) |
| 9 | 13 | Real-time new post in admin |
| 10 | 14 | Optimistic UI for create user |
| 11 | 15 | Computed field (post count per user) |

## Rules

- **Do not modify** existing blog code (App.jsx, PostsList, etc.) except where an exercise explicitly asks.
- **Add new** schema, resolvers, and admin UI in the appropriate places.
- Server schema: `server/schema/admin.graphql` (already created).
- Server resolvers: `server/resolvers/admin.js` (already created – implement the TODOs).

## Auth Note

From **Exercise 8** onward, the Admin page and admin API require authentication. Tests use a helper that logs in as `alice` (created if needed). Ensure the server has at least one user for tests to pass.
