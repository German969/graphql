# Lesson 15: The Resolver Parent Parameter

## Goal

Understand the **parent** parameter (first argument) in GraphQL resolvers. Parent is the result of the parent field’s resolver—it’s the object you’re resolving a field *on*.

## Resolver signature

Every resolver receives four arguments:

```js
fieldName(parent, args, context, info)
```

| Parameter | Role |
|-----------|------|
| **parent** | The value returned by the parent field’s resolver (the object this field belongs to). |
| **args** | The arguments passed to this field (e.g. `id`, `limit`). |
| **context** | Shared request-scoped data (auth, db). |
| **info** | Metadata about the operation (schema, selection set, etc.). |

## When is parent used?

- **Root fields** (`Query`, `Mutation`, `Subscription`): Parent is the **root value** (often `{}` or `undefined`). You usually ignore it.
- **Nested fields** (e.g. `Post.author`): Parent is the **parent object**—the `Post` that was returned by the previous resolver.

GraphQL resolves fields in a **top-down** order. The client asks for `posts { id title author { username } }`. The server:

1. Resolves `Query.posts` → returns `[{ id: 1, title: "...", authorId: 1 }, ...]`
2. For each post, resolves `Post.id`, `Post.title` (often from parent directly)
3. For each post, resolves `Post.author` → **parent** is that post object

So when resolving `Post.author`, **parent** is the post. You use it to get `parent.authorId` (or `parent.author` if already populated) and return the `User`.

## Example: root vs nested

### Root field (parent unused)

```js
// Query.posts – parent is the root (empty object or undefined)
posts(parent, args, context) {
  return getAllPosts(context.db, args.limit);
}
```

Here `parent` is the root value. We don’t need it; we use `args` and `context` to fetch posts.

### Nested field (parent is the post)

```js
// Post.author – parent is the Post object
Post: {
  author(parent, args, context) {
    if (parent.author) return parent.author;  // already populated from DB
    if (parent.authorId) {
      return getUserById(context.db, parent.authorId);
    }
    return null;
  },
}
```

- **parent** = the `Post` returned by `Query.posts` or `Query.post`
- **parent.authorId** = the foreign key to look up the user
- **parent.author** = if the DB layer already joined and returned the author, we can return it directly

## How parent flows

For a query like:

```graphql
query {
  posts {
    id
    title
    author {
      username
    }
  }
}
```

The resolution flow:

1. `Query.posts(parent, args, context)`  
   - `parent` = root  
   - Returns `[{ id: 1, title: "Hi", authorId: 1, author: { id: 1, username: "alice", displayName: "Alice" } }, ...]`

2. For each post, `Post.id`, `Post.title`  
   - If there’s no resolver, GraphQL uses the property from the parent (e.g. `parent.id`).  
   - If there is a resolver, `parent` is that post.

3. `Post.author(parent, args, context)`  
   - `parent` = `{ id: 1, title: "Hi", authorId: 1, author: {...} }`  
   - Returns `parent.author` or looks up by `parent.authorId`

4. For each author, `User.username`  
   - `parent` = the `User` object  
   - Returns `parent.username`

## Default behavior: no resolver

If you don’t define a resolver for a field, GraphQL uses the **default resolver**: it reads the property from the parent with the same name. So `Post.title` with no resolver returns `parent.title`. You only add a resolver when you need custom logic (e.g. a join, a computed field, or a different data source).

## Example: computed field using parent

The codebase includes a real example: `Post.excerpt` in `server/resolvers/post.js`:

```js
Post: {
  excerpt(parent) {
    if (!parent?.body) return '';
    const body = String(parent.body);
    return body.length <= 10
      ? body
      : body.slice(0, 10) + '...';
  },
}
```

Here **parent** is the post. We use `parent.body` to compute the excerpt. You can query it:

```graphql
query {
  posts {
    title
    excerpt
  }
}
```

## Summary

| Situation | parent value |
|-----------|--------------|
| `Query.posts` | Root value (often `{}`) |
| `Mutation.publishPost` | Root value |
| `Post.author` | The `Post` object |
| `User.displayName` | The `User` object |
| `PostEdge.node` | The edge object (e.g. `{ node, cursor }`) |

**parent** is always the result of the *parent field’s* resolver. Use it when resolving nested fields to access the object you’re resolving on.
