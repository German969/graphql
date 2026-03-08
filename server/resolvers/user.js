import { getUserByUsername, createUser as createUserInDb } from '../db.js';

/**
 * Resolvers for User-related Query and Mutation (user, createUser).
 */
export const userResolvers = {
  user({ username }) {
    return getUserByUsername(username) ?? null;
  },
  createUser({ username, displayName }) {
    return createUserInDb(username, displayName);
  },
};
