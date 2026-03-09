import { GraphQLError } from 'graphql';

/** Code Apollo Server uses for client/validation errors (we skip logging these in formatError). */
export const BAD_USER_INPUT = 'BAD_USER_INPUT';

/**
 * Throw a user-input error. Apollo Server 4 does not export UserInputError;
 * use GraphQLError with this code so clients get a clear message and formatError can skip logging.
 */
export function UserInputError(message, options = {}) {
  return new GraphQLError(message, {
    extensions: {
      code: BAD_USER_INPUT,
      ...(options.argumentName && { argumentName: options.argumentName }),
    },
  });
}
