import { getAllPosts, insertPost } from './db.js';

/**
 * Resolvers implement the schema: each field gets a function
 * that returns the value. Query and Mutation both use this root object.
 * Posts are stored in SQLite (server/blog.db).
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
    publishPost({ title, body }) {
      return insertPost(title, body);
    },
  };
}
