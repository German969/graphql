import { getAllPosts, getPostById, getPostsConnection, getUserByUsername, insertPost } from '../db.js';

/**
 * Resolvers for Post-related Query and Mutation (posts, post, postsConnection, publishPost).
 */
export const postResolvers = {
  posts(_, { limit }) {
    return getAllPosts(limit);
  },
  post(_, { id }) {
    return getPostById(id) ?? null;
  },
  postsConnection(_, { first, after }) {
    return getPostsConnection(first, after ?? undefined);
  },
  publishPost(_, { title, body, authorUsername }) {
    const author = getUserByUsername(authorUsername);
    if (!author) {
      throw new Error(`User not found: ${authorUsername}. Create the user first with createUser.`);
    }
    return insertPost(title, body, Number(author.id));
  },
};
