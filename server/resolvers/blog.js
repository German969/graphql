/**
 * Resolvers for blog-level Query fields (blogName, serverTime).
 */
export const blogResolvers = {
  blogName() {
    return 'Learn GraphQL Blog';
  },
  serverTime() {
    return new Date().toISOString();
  },
};
