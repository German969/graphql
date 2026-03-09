import { UserInputError } from '../errors.js';
import { encodeToken, decodeToken, validatePassword } from '../auth.js';
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
 * Resolvers for User-related Query and Mutation (user, createUser, login, me).
 */
export const userResolvers = {
  user(_, { username }, context) {
    return getUserByUsername(context.db, username) ?? null;
  },
  me(_, __, context) {
    const user = context?.user;
    if (!user?.username) return null;
    return getUserByUsername(context.db, user.username) ?? null;
  },
  createUser(_, { username, displayName }, context) {
    const validated = validateCreateUser(username, displayName);
    return createUserInDb(context.db, validated.username, validated.displayName);
  },
  login(_, { username, password, displayName }, context) {
    const u = typeof username === 'string' ? username.trim() : '';
    const p = typeof password === 'string' ? password : '';
    if (u.length < MIN_USERNAME_LENGTH) {
      throw UserInputError('Username is required.', { argumentName: 'username' });
    }
    if (u.length > MAX_USERNAME_LENGTH) {
      throw UserInputError(`Username must be at most ${MAX_USERNAME_LENGTH} characters.`, {
        argumentName: 'username',
      });
    }
    if (!validatePassword(u, p)) {
      throw UserInputError('Invalid password. For this demo, password must equal username.', {
        argumentName: 'password',
      });
    }

    let user = getUserByUsername(context.db, u);
    if (!user) {
      const d = typeof displayName === 'string' ? displayName.trim() : '';
      const displayNameToUse = d.length >= MIN_DISPLAY_NAME_LENGTH ? d : u;
      if (d.length < MIN_DISPLAY_NAME_LENGTH && d.length > 0) {
        throw UserInputError('Display name is required when creating a new user.', {
          argumentName: 'displayName',
        });
      }
      user = createUserInDb(context.db, u, displayNameToUse);
    }

    const token = encodeToken(user.username);
    return { token, user };
  },
};
