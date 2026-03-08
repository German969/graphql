# Lesson 2: First Query from the Client

## Goal

Call your GraphQL API from a React app using plain `fetch`—no Apollo yet. You’ll see how a GraphQL request is just an HTTP POST with a query string.

## How GraphQL is sent over HTTP

GraphQL is transport-agnostic, but over HTTP it’s usually:

- **Method:** POST  
- **URL:** Your API endpoint (e.g. `/graphql`)  
- **Body:** JSON with at least `query`, and optionally `variables`:

```json
{
  "query": "query { blogName serverTime }",
  "variables": {}
}
```

The server responds with JSON in this shape:

```json
{
  "data": { "blogName": "Learn GraphQL Blog", "serverTime": "...", "posts": [] },
  "errors": null
}
```

If something goes wrong, `errors` is an array of error objects; `data` may still be partial.

## What we added

### 1. Proxy (Vite)

In `client/vite.config.js` we proxy `/graphql` to the backend:

```js
server: {
  proxy: { '/graphql': 'http://localhost:4000' },
}
```

So the React app can `fetch('/graphql')` and Vite forwards it to the Node server. No CORS setup needed in dev.

### 2. Tiny GraphQL client (`client/src/graphql.js`)

A small helper that:

1. POSTs to `/graphql` with `Content-Type: application/json`
2. Sends `{ query, variables }`
3. Parses the JSON and throws if `errors` is set
4. Returns `data`

So from React you only deal with the resolved `data`.

### 3. App component

The app runs one query on mount: it asks for `blogName`, `serverTime`, and `posts` (with each post’s `id`, `title`, `body`, `publishedAt`):

```graphql
query BlogQuery {
  blogName
  serverTime
  posts {
    id
    title
    body
    publishedAt
  }
}
```

It stores the result in state and shows the blog name, server time, and list of posts. Same query you can run in GraphiQL—now from the browser via React.

## How to run

1. Start the **server**: `cd server && npm run dev`
2. Start the **client**: `cd client && npm run dev`
3. Open the client URL (e.g. http://localhost:5173). You should see the blog name, server time, and an empty posts list (until you publish posts in Lesson 3).

## Takeaways

| Concept | Role |
|--------|------|
| **HTTP** | GraphQL is typically one POST per request; body = `query` (+ optional `variables`). |
| **Response** | Always JSON with `data` (and optionally `errors`). |
| **Client** | Any HTTP client works; we used `fetch` and a thin wrapper. |

Next: **Lesson 3** – Add mutations so the client can publish new posts.
