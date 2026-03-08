# Lesson 6: Apollo Client

## Goal

Use **Apollo Client** in the React app instead of raw `fetch` and the small `graphql()` helper. You’ll see how Apollo gives you **`useQuery`**, **`useMutation`**, a **cache**, and a **Provider** so components stay simple and data stays in sync.

## What is Apollo Client?

**Apollo Client** is a popular GraphQL client for the browser (and other platforms). It:

- Sends queries and mutations to your GraphQL API (like our `graphql()` helper did).
- Keeps a **normalized cache** of the result data so repeated reads can come from cache.
- Exposes **React hooks** (`useQuery`, `useMutation`) so components declare what data they need and Apollo handles loading, errors, and refetching.
- Can refetch or update the cache after mutations so the UI stays consistent.

We keep the same backend (Express + graphql-js); only the frontend switches to Apollo.

## Setup: ApolloProvider and client

**1. Install Apollo Client**

```bash
cd client && npm install @apollo/client
```

**2. Create the client and wrap the app**

In **`client/src/main.jsx`** we create an **`ApolloClient`** and wrap the app in **`ApolloProvider`**:

```js
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'
import App from './App.jsx'

const client = new ApolloClient({
  uri: '/graphql',
  cache: new InMemoryCache(),
})

createRoot(document.getElementById('root')).render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
)
```

- **`uri`** – Where to send GraphQL requests (we use the Vite proxy to the Node server).
- **`cache`** – **InMemoryCache** stores query results by query and variables so Apollo can return cached data when the same query runs again.

Any component inside **`ApolloProvider`** can use Apollo hooks.

## useQuery: loading the feed

Instead of `getFeed()` in a `useEffect`, we use **`useQuery`** and pass the GraphQL document (built with **`gql`** from `@apollo/client`):

```js
import { gql, useQuery, useMutation } from '@apollo/client'

const BLOG_QUERY = gql`
  query BlogQuery {
    blogName
    serverTime
    posts {
      id
      title
      body
      publishedAt
      author { id username displayName }
    }
  }
`

function App() {
  const { data, loading, error } = useQuery(BLOG_QUERY)
  // data.blogName, data.serverTime, data.posts
  // loading true while the request is in flight
  // error set if the request failed
}
```

Apollo runs the query when the component mounts, and keeps **data**, **loading**, and **error** in sync. No manual `useState` or `useEffect` for the initial fetch.

## useMutation: createUser and publishPost

For mutations we use **`useMutation`**:

```js
const CREATE_USER_MUTATION = gql`
  mutation CreateUser($username: String!, $displayName: String!) {
    createUser(username: $username, displayName: $displayName) {
      id username displayName
    }
  }
`

const [createUserMutation, { error: createUserError }] = useMutation(CREATE_USER_MUTATION)
```

Calling **`createUserMutation({ variables: { username, displayName } })`** runs the mutation. The hook returns a function that you call when the user submits the form.

For **publishPost**, after a successful mutation we want the posts list to update. Two options:

1. **Refetch** – Ask Apollo to run the feed query again: **`refetchQueries: [{ query: BLOG_QUERY }]`** in the mutation options.
2. **Update the cache** – Write the new post into the cache (more advanced; see Apollo docs).

We use **refetchQueries** so the list updates right after publishing.

## What we changed in the app

- **`main.jsx`** – Creates **`ApolloClient`** (uri **`/graphql`**, **InMemoryCache**), wraps the app in **`ApolloProvider`**.
- **`App.jsx`** – Uses **`useQuery(BLOG_QUERY)`** for the feed (replaces `getFeed()` and related state). Uses **`useMutation(CREATE_USER_MUTATION)`** and **`useMutation(PUBLISH_POST_MUTATION, { refetchQueries: [BLOG_QUERY] })`** for the forms. Operations are defined with **`gql`** in the same file (or you can move them to **`client/src/graphql/operations.js`**).
- The **services** (**`posts.js`**, **`users.js`**) are no longer used by the blog UI; the component talks to Apollo via hooks. You can keep the services for non-React code or remove them.

## Takeaways

| Concept | Role |
|--------|------|
| **Apollo Client** | GraphQL client with cache and React hooks. |
| **ApolloProvider** | Wraps the app so components can use `useQuery` / `useMutation`. |
| **useQuery** | Runs a query on mount, returns `{ data, loading, error }` and optional **refetch**. |
| **useMutation** | Returns a function that runs the mutation; you can pass **variables** and options like **refetchQueries**. |
| **gql** | Tagged template to define GraphQL operations for Apollo. |
| **InMemoryCache** | Stores query results so repeated queries can be served from cache. |

Next steps could be: **Apollo Server** on the backend (Lesson 7), or **cache updates** and **optimistic UI** with Apollo Client.
