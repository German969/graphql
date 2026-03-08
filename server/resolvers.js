import { getAllPosts, getUserByUsername, createUser, insertPost } from './db.js';

/**
 * Resolvers implement the schema: each field gets a function
 * that returns the value. Query and Mutation both use this root object.
 * Posts and users are stored in SQLite (server/blog.db).
 */
export function createRootValue() {
  return {
    blogName() {
      return 'Learn GraphQL Blog';
    },
    serverTime() {
      return new Date().toISOString();
    },
    posts() {
      return getAllPosts();
    },
    user({ username }) {
      return getUserByUsername(username) ?? null;
    },
    createUser({ username, displayName }) {
      return createUser(username, displayName);
    },
    publishPost({ title, body, authorUsername }) {
      const author = getUserByUsername(authorUsername);
      if (!author) {
        throw new Error(`User not found: ${authorUsername}. Create the user first with createUser.`);
      }
      return insertPost(title, body, Number(author.id));
    },
  };
}
