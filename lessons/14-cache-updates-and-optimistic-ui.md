# Lesson 14: Cache Updates and Optimistic UI

## Goal

Use **cache updates** to add new posts to the feed without refetching, and **optimistic UI** to show the post immediately before the server responds. When the server returns, we replace the optimistic post with the real one; if the mutation fails, Apollo rolls back.

## Why cache updates?

By default, after a mutation you either **refetch** (extra request) or rely on the mutation result (which only updates the cached mutation field, not related queries). **Cache updates** let you manually update the cache so related queries (e.g. `postsConnection`) reflect the change. No refetch needed.

## Why optimistic UI?

Users expect instant feedback. If you wait for the server before showing the new post, the UI feels slow. **Optimistic UI** shows the expected result immediately, then replaces it with the real data when the server responds. If the mutation fails, Apollo rolls back the optimistic update.

## The update function

Pass an **update** function to `useMutation`. It runs after the mutation (for both optimistic and real responses):

```js
useMutation(PUBLISH_POST_MUTATION, {
  update(cache, { data }) {
    const newPost = data?.publishPost;
    if (newPost) prependPostToConnection(cache, newPost, queryVars);
  },
});
```

- **cache** – Apollo’s `InMemoryCache`; use `cache.modify` to change stored data.
- **data** – The mutation result. For optimistic responses it’s the `optimisticResponse`; for real responses it’s the server payload.
- **prependPostToConnection** – A helper that prepends the post to `postsConnection` for the current `queryVars`.

## optimisticResponse

Pass **optimisticResponse** when calling the mutation (or in the hook options). It must match the mutation’s return shape:

```js
publishPostMutation({
  variables: { title, body, authorUsername },
  optimisticResponse: {
    publishPost: {
      __typename: 'Post',
      id: `optimistic-${Date.now()}`,
      title,
      body,
      publishedAt: new Date().toISOString(),
      author: { __typename: 'User', id: 'temp', username, displayName },
    },
  },
});
```

- Use a **temporary id** (e.g. `optimistic-${Date.now()}`) so it’s easy to remove when the real post arrives.
- Include **__typename** so Apollo normalizes correctly.
- Apollo applies this to the cache immediately, then runs **update**. When the server responds, it runs **update** again with the real data.

## Updating a relay-style connection

With **relayStylePagination**, the connection is stored by arguments (e.g. `first`, `after`, `authorUsername`, `orderBy`). Use **cache.modify** to change the right connection:

```js
cache.modify({
  fields: {
    postsConnection(existingConnection, { storeFieldName, readField }) {
      if (!storeFieldMatches(storeFieldName, queryVars)) return existingConnection;

      const newEdge = { __typename: 'PostEdge', node: newPost, cursor: newPost.id };
      const existingEdges = existingConnection?.edges ?? [];

      // When adding real post, remove any optimistic post
      const isRealPost = !String(newPost.id).startsWith('optimistic-');
      const filteredEdges = isRealPost
        ? existingEdges.filter((edge) => {
            const node = readField('node', edge);
            const id = readField('id', node);
            return !String(id).startsWith('optimistic-');
          })
        : existingEdges;

      return {
        ...existingConnection,
        edges: [newEdge, ...filteredEdges],
      };
    },
  },
});
```

- **storeFieldName** – Identifies which cached connection this is (e.g. `postsConnection:{"first":5,...}`). Only modify the one that matches the current query vars.
- **readField** – Use to read fields from cache references (e.g. `readField('id', node)`).
- **Return** – The new connection object. Preserve `pageInfo` and other fields.

## Flow

1. User submits → mutation runs with `optimisticResponse`.
2. Apollo writes optimistic data to the cache → **update** runs with optimistic post.
3. Helper prepends optimistic post to `postsConnection` → UI shows it immediately.
4. Server responds → Apollo merges real result → **update** runs with real post.
5. Helper removes optimistic post (by id prefix), prepends real post → UI shows final data.
6. If mutation fails → Apollo rolls back optimistic changes.

## Summary

| Concept | Role |
|--------|------|
| **update** | Function that runs after the mutation; use `cache.modify` to update related queries. |
| **optimisticResponse** | Fake result applied immediately; rolled back if the mutation fails. |
| **cache.modify** | Change cached fields; use `storeFieldName` to target the right connection. |
| **Temporary id** | Use `optimistic-*` so you can remove the optimistic post when the real one arrives. |
