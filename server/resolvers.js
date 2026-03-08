let nextPostId = 1;
const posts = [];

/**
 * Resolvers implement the schema: each field gets a function
 * that returns the value. Query and Mutation both use this root object.
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
      return [...posts];
    },
    publishPost({ title, body }) {
      const post = {
        id: String(nextPostId++),
        title,
        body,
        publishedAt: new Date().toISOString(),
      };
      posts.push(post);
      return post;
    },
  };
}
