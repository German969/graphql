import { UserInputError } from '../errors.js';
import { getUserByUsername, createUser as createUserInDb } from '../db.js';

const MIN_USERNAME_LENGTH = 1;
const MAX_USERNAME_LENGTH = 50;
const MIN_DISPLAY_NAME_LENGTH = 1;
const MAX_DISPLAY_NAME_LENGTH = 100;

function validateCreateUser(username, displayName) {
  const u = typeof username === 'string' ? username.trim() : '';
  const d = typeof displayName === 'string' ? displayName.trim() : '';
  if (u.length < MIN_USERNAME_LENGTH) {
    throw UserInputError('Username is required.', { argumentName: 'username' });
  }
  if (u.length > MAX_USERNAME_LENGTH) {
    throw UserInputError(`Username must be at most ${MAX_USERNAME_LENGTH} characters.`, {
      argumentName: 'username',
    });
  }
  if (d.length < MIN_DISPLAY_NAME_LENGTH) {
    throw UserInputError('Display name is required.', { argumentName: 'displayName' });
  }
  if (d.length > MAX_DISPLAY_NAME_LENGTH) {
    throw UserInputError(`Display name must be at most ${MAX_DISPLAY_NAME_LENGTH} characters.`, {
      argumentName: 'displayName',
    });
  }
  return { username: u, displayName: d };
}

/**
 * Resolvers for User-related Query and Mutation (user, createUser).
 */
export const userResolvers = {
  user(_, { username }) {
    return getUserByUsername(username) ?? null;
  },
  createUser(_, { username, displayName }) {
    const validated = validateCreateUser(username, displayName);
    return createUserInDb(validated.username, validated.displayName);
  },
};
