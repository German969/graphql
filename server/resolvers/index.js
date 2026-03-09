import { blogResolvers } from './blog.js';
import { userResolvers } from './user.js';
import { postResolvers, postTypeResolvers, subscriptionResolvers } from './post.js';

/**
 * Apollo Server expects resolvers by type (Query, Mutation, Subscription).
 * We map our flat domain resolvers into that shape.
 */
export const resolvers = {
  Query: {
    ...blogResolvers,
    user: userResolvers.user,
    me: userResolvers.me,
    posts: postResolvers.posts,
    post: postResolvers.post,
    postsConnection: postResolvers.postsConnection,
  },
  Mutation: {
    createUser: userResolvers.createUser,
    login: userResolvers.login,
    publishPost: postResolvers.publishPost,
  },
  Subscription: subscriptionResolvers.Subscription,
  Post: postTypeResolvers.Post,
};

/** @deprecated Used only with express-graphql; Apollo uses `resolvers` above. */
export function createRootValue() {
  return {
    ...blogResolvers,
    ...userResolvers,
    ...postResolvers,
  };
}
