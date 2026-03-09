# Lesson 13: Subscriptions

## Goal

Add **GraphQL subscriptions** for real-time updates (e.g. when a new post is published). Use **graphql-ws** over WebSocket and show how **context** is built differently for subscriptions than for HTTP queries and mutations.

## Why subscriptions?

Queries and mutations use HTTP: the client sends a request, the server responds, the connection closes. For real-time updates (e.g. “notify me when a new post is published”), you’d otherwise have to poll. **Subscriptions** keep a WebSocket connection open; the server pushes events when they happen.

## Two transports, two context entry points

With Apollo Server you typically have:

1. **HTTP** – Queries and mutations via `expressMiddleware`. Context is built from the **request** (e.g. `req.headers.authorization`).
2. **WebSocket** – Subscriptions via **graphql-ws**. Context is built from **connection params** when the client connects, not from HTTP headers.

So you need **two context builders** that produce the same shape (`{ user, db }`):

- **HTTP**: `context: async ({ req }) => buildContextFromAuth(req.headers?.authorization)`
- **WebSocket**: `context: async (ctx) => buildContextFromAuth(ctx.connectionParams?.authorization)`

The client sends auth in different places:

- **HTTP**: `Authorization` header on each request (via `setContext` link).
- **WebSocket**: `connectionParams` when establishing the connection (e.g. `{ authorization: 'Bearer ...' }`).

## Server setup: HTTP + WebSocket

1. **Create an HTTP server** – Use `createServer(app)` instead of `app.listen()` so you can attach a WebSocket server to the same port.

2. **WebSocket server** – Use `ws` and `graphql-ws`:

```js
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/use/ws';

const httpServer = createServer(app);
const wsServer = new WebSocketServer({ server: httpServer, path: '/graphql' });

useServer({
  schema,
  context: async (ctx) => {
    const auth = ctx.connectionParams?.authorization ?? ctx.connectionParams?.Authorization ?? null;
    return buildContextFromAuth(auth);
  },
}, wsServer);

httpServer.listen(PORT);
```

3. **Shared context builder** – Extract the auth logic so both HTTP and WebSocket use it:

```js
function buildContextFromAuth(authHeaderOrToken) {
  const token = typeof authHeaderOrToken === 'string' && authHeaderOrToken.startsWith('Bearer ')
    ? authHeaderOrToken.slice(7)
    : authHeaderOrToken;
  const decoded = token ? decodeToken(token) : null;
  return { user: decoded, db };
}
```

## Schema and resolver

Add a subscription field:

```graphql
type Subscription {
  postPublished: Post!
}
```

The resolver returns an **async iterator** (from PubSub):

```js
postPublished: {
  subscribe: (_, __, context) => {
    if (!context?.user?.username) {
      throw new Error('Authentication required for postPublished subscription.');
    }
    return pubsub.asyncIterator(POST_PUBLISHED);
  },
},
```

When `publishPost` runs, it calls `pubsub.publish(POST_PUBLISHED, { postPublished: post })`, and all subscribers receive the new post. The subscription resolver uses **context** to require auth—same pattern as `me`, but the context came from WebSocket connection params.

## Client: split link and connection params

Apollo Client uses a **split** link: subscriptions go over WebSocket, queries and mutations over HTTP.

```js
import { split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

const wsLink = new GraphQLWsLink(
  createClient({
    url: `ws://${window.location.host}/graphql`,
    connectionParams: () => {
      const token = getAuthToken();
      return token ? { authorization: `Bearer ${token}` } : {};
    },
  })
);

const splitLink = split(
  ({ query }) => {
    const def = getMainDefinition(query);
    return def.kind === 'OperationDefinition' && def.operation === 'subscription';
  },
  wsLink,
  authLink.concat(httpLink)
);
```

- **connectionParams** – Sent when the WebSocket connects. The server reads `ctx.connectionParams.authorization` and builds context.
- **split** – If the operation is a subscription, use `wsLink`; otherwise use the HTTP link.

If the user logs in after the page loads, the WebSocket may have connected without a token. Reconnecting (or refreshing) will send the new token in `connectionParams`.

## Summary: context for HTTP vs WebSocket

| Transport | Context entry point | Where client sends auth |
|-----------|---------------------|-------------------------|
| **HTTP** (queries, mutations) | `expressMiddleware` → `context: async ({ req }) => ...` | `Authorization` header on each request |
| **WebSocket** (subscriptions) | `useServer` → `context: async (ctx) => ...` | `connectionParams` when connecting |

Use a shared `buildContextFromAuth` so both paths produce the same `{ user, db }` shape. Resolvers don’t care how context was built—they just read `context.user` and `context.db`.
