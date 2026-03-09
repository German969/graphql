import { UserInputError } from '../errors.js';
import { getAllPosts, getPostById, getPostsConnection, getUserByUsername, insertPost } from '../db.js';
import { pubsub, POST_PUBLISHED } from '../pubsub.js';

const MIN_TITLE_LENGTH = 1;
const MAX_TITLE_LENGTH = 200;
const MIN_BODY_LENGTH = 1;
const MAX_BODY_LENGTH = 10_000;

function validatePublishPost(title, body, authorUsername) {
  const t = typeof title === 'string' ? title.trim() : '';
  const b = typeof body === 'string' ? body.trim() : '';
  const author = typeof authorUsername === 'string' ? authorUsername.trim() : '';
  if (t.length < MIN_TITLE_LENGTH) {
    throw UserInputError('Title is required.', { argumentName: 'title' });
  }
  if (t.length > MAX_TITLE_LENGTH) {
    throw UserInputError(`Title must be at most ${MAX_TITLE_LENGTH} characters.`, {
      argumentName: 'title',
    });
  }
  if (b.length < MIN_BODY_LENGTH) {
    throw UserInputError('Body is required.', { argumentName: 'body' });
  }
  if (b.length > MAX_BODY_LENGTH) {
    throw UserInputError(`Body must be at most ${MAX_BODY_LENGTH} characters.`, {
      argumentName: 'body',
    });
  }
  if (author.length < 1) {
    throw UserInputError('Author username is required.', { argumentName: 'authorUsername' });
  }
  return { title: t, body: b, authorUsername: author };
}

/**
 * Resolvers for Post-related Query and Mutation (posts, post, postsConnection, publishPost).
 */
export const postResolvers = {
  posts(_, { limit, authorUsername, orderBy }, context) {
    return getAllPosts(
      context.db,
      limit ?? undefined,
      authorUsername ?? undefined,
      orderBy ?? 'PUBLISHED_AT_DESC'
    );
  },
  post(_, { id }, context) {
    return getPostById(context.db, id) ?? null;
  },
  postsConnection(_, { first, after, authorUsername, orderBy }, context) {
    return getPostsConnection(
      context.db,
      first ?? 10,
      after ?? undefined,
      authorUsername ?? undefined,
      orderBy ?? 'PUBLISHED_AT_DESC'
    );
  },
  publishPost(_, { title, body, authorUsername }, context) {
    const validated = validatePublishPost(title, body, authorUsername);
    const author = getUserByUsername(context.db, validated.authorUsername);
    if (!author) {
      throw UserInputError(`User not found: ${validated.authorUsername}. Create the user first with createUser.`, {
        argumentName: 'authorUsername',
      });
    }
    const post = insertPost(context.db, validated.title, validated.body, Number(author.id));
    pubsub.publish(POST_PUBLISHED, { postPublished: post });
    return post;
  },
};

export const subscriptionResolvers = {
  Subscription: {
    postPublished: {
      subscribe: (_, __, context) => {
        if (!context?.user?.username) {
          throw new Error('Authentication required for postPublished subscription.');
        }
        return pubsub.asyncIterator(POST_PUBLISHED);
      },
    },
  },
};
