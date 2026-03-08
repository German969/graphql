import { getAllPosts, getUserByUsername, insertPost } from '../db.js';

/**
 * Resolvers for Post-related Query and Mutation (posts, publishPost).
 */
export const postResolvers = {
  posts() {
    return getAllPosts();
  },
  publishPost({ title, body, authorUsername }) {
    const author = getUserByUsername(authorUsername);
    if (!author) {
      throw new Error(`User not found: ${authorUsername}. Create the user first with createUser.`);
    }
    return insertPost(title, body, Number(author.id));
  },
};
