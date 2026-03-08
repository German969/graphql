import { blogResolvers } from './blog.js';
import { userResolvers } from './user.js';
import { postResolvers } from './post.js';

/**
 * Combines resolvers by domain (blog, user, post) into a single root value.
 * Keeps Query and Mutation organized as the app grows.
 */
export function createRootValue() {
  return {
    ...blogResolvers,
    ...userResolvers,
    ...postResolvers,
  };
}
