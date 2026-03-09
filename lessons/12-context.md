# Lesson 12: Context

## Goal

Use **context** in Apollo Server to pass request-scoped data (like the authenticated user) to every resolver. Context is built once per request and shared across all resolvers for that operation, so you can centralize auth parsing and access it anywhere.

## Why context?

Resolvers receive four arguments: `(parent, args, context, info)`. **Context** is the third. It holds data that is:

- **Request-scoped** – Built fresh for each GraphQL request (e.g. HTTP request).
- **Shared** – The same object is passed to every resolver in that operation.
- **Useful for** – Authentication (current user), database connections, request IDs, etc.

Without context, you’d have to pass the current user through every resolver chain or re-parse the token in each resolver. With context, you parse once (e.g. from the `Authorization` header) and put the result in `context.user`; any resolver can read it.

## Setting up context

With **expressMiddleware** from `@as-integrations/express4`, you pass a `context` option. It’s an async function that receives `{ req, res }` and returns the context object:

```js
// server/index.js
expressMiddleware(server, {
  context: async ({ req }) => {
    const auth = req.headers?.authorization;
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
    const decoded = token ? decodeToken(token) : null;
    return { user: decoded };
  },
})
```

- **req** – Express request object. You can read headers, cookies, etc.
- **Return value** – The object that becomes `context` for all resolvers in this request.
- **user** – `decoded` is `{ username }` when the token is valid, or `null` when missing/expired.

So every GraphQL operation gets `context.user` set before any resolver runs.

## Injecting the database connection

Context is also a good place to put the **database connection** (or a connection from a pool). That way resolvers use `context.db` instead of importing the db module directly. Benefits:

- **Testability** – You can inject a mock or in-memory db in tests.
- **Consistency** – All data access goes through context.
- **Connection pools** – With PostgreSQL, etc., you get a connection from the pool per request and release it when done.

**Add db to context:**

```js
// server/index.js
import { db } from './db.js';

expressMiddleware(server, {
  context: async ({ req }) => {
    const auth = req.headers?.authorization;
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
    const decoded = token ? decodeToken(token) : null;
    return {
      user: decoded,
      db,
    };
  },
})
```

For **SQLite** (better-sqlite3), the same `db` instance is reused for all requests—it’s a single long-lived connection. For **PostgreSQL** or similar, you’d typically get a connection from a pool in the context function and return it:

```js
context: async ({ req }) => {
  const conn = await pool.connect();
  return { db: conn, user: decoded };
}
```

(You’d also need to release the connection when the operation finishes; Apollo’s `plugins` or `willSendResponse` can help.)

**Resolver using context.db:**

```js
// Instead of: import { getUserByUsername } from '../db.js';
user(_, { username }, context) {
  const row = context.db.prepare(
    'SELECT id, username, display_name AS displayName FROM users WHERE username = ?'
  ).get(username);
  return row ? mapRowToUser(row) : null;
}
```

This project injects `db` into context and passes `context.db` to all db layer functions (`getUserByUsername`, `getAllPosts`, etc.), so resolvers receive the connection via context instead of importing it.

## Using context in resolvers

Resolvers receive context as the third parameter:

```js
// server/resolvers/user.js
me(_, __, context) {
  const user = context?.user;
  if (!user?.username) return null;
  return getUserByUsername(user.username) ?? null;
}
```

- `_` – parent (unused for root fields).
- `__` – args (unused for `me`).
- **context** – the object returned by the context function.

The `me` query returns the current user when `context.user` is set (valid token), and `null` when it isn’t (no token or expired).

## Auth flow end-to-end

1. **Client logs in** – Calls `login(username, password, displayName)` mutation. Server validates (password must equal username in this demo), creates user if needed, and returns `{ token, user }`.
2. **Client stores token** – Saves the token in `localStorage` and the user for display.
3. **Client sends token** – Apollo Client uses `setContext` to add `Authorization: Bearer <token>` to every request.
4. **Server parses token** – The context function reads the header, decodes the token, and sets `context.user`.
5. **Resolvers use context** – `me` and any other resolver can read `context.user` to know who is authenticated.

## Client: auth link

To send the token with every request, Apollo Client uses a link chain. `setContext` runs before each request and adds the header:

```js
// client/src/main.jsx
import { createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

const httpLink = createHttpLink({ uri: '/graphql' })
const authLink = setContext((_, { headers }) => {
  const token = getAuthToken()
  return {
    headers: {
      ...headers,
      ...(token && { authorization: `Bearer ${token}` }),
    },
  }
})

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({ ... }),
})
```

- **authLink** – Runs first, reads the token from storage, and merges it into the headers.
- **httpLink** – Sends the request with those headers.

## Summary

| Concept | Role |
|--------|------|
| **Context** | Request-scoped object passed to every resolver; built once per operation. |
| **context option** | Async function `({ req }) => ({ ... })` that returns the context. |
| **context.db** | Inject the db connection so resolvers use `context.db` instead of importing it; helps with testing and pooled connections. |
| **Third resolver arg** | `(parent, args, context, info)` – use `context` for auth, DB, etc. |
| **Auth flow** | Token in header → context function decodes → `context.user` → resolvers read it. |
| **setContext link** | Apollo Client link that adds `Authorization: Bearer <token>` to each request. |

Next steps could be **protected fields** (throw when `context.user` is null), **role-based access**, or **subscriptions** with context over WebSocket.
