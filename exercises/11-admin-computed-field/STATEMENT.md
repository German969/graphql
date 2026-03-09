# Exercise 11: Computed Field (Post Count per User)

**Lessons:** 15 (Resolver parent parameter)

## Goal

Add a computed field `postCount` to the `User` type that returns how many posts the user has written. Use the `parent` parameter in the resolver.

## Requirements

### Server

1. **Schema** in `server/schema/user.graphql`:
   - Add `postCount: Int!` to the `User` type

2. **Resolver** in `server/resolvers/user.js`:
   - Add `User: { postCount(parent, _, context) { ... } }` 
   - Use `parent.id` to count posts where `author_id = parent.id`
   - Add `getPostCountByAuthorId(database, authorId)` to `server/db.js`

3. **Wire** the resolver in `server/resolvers/index.js` (merge into User type)

### Client

4. **Admin users list**:
   - Include `postCount` in the `adminUsers` query (or when displaying User)
   - Show post count next to each user in the admin list

## Hints

- `parent` in `User.postCount` is the User object from the parent resolver
- `SELECT COUNT(*) FROM posts WHERE author_id = ?`

## Done when

All tests in `11-admin-computed-field.spec.js` pass.
