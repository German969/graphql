import { blogResolvers } from './blog.js';
import { userResolvers } from './user.js';
import { postResolvers } from './post.js';

/**
 * Apollo Server expects resolvers by type (Query, Mutation).
 * We map our flat domain resolvers into that shape.
 */
export const resolvers = {
  Query: {
    ...blogResolvers,
    user: userResolvers.user,
    posts: postResolvers.posts,
  },
  Mutation: {
    createUser: userResolvers.createUser,
    publishPost: postResolvers.publishPost,
  },
};

/** @deprecated Used only with express-graphql; Apollo uses `resolvers` above. */
export function createRootValue() {
  return {
    ...blogResolvers,
    ...userResolvers,
    ...postResolvers,
  };
}
