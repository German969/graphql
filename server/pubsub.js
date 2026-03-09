import { PubSub } from 'graphql-subscriptions';

/** Shared PubSub instance for subscription events. */
export const pubsub = new PubSub();

export const POST_PUBLISHED = 'POST_PUBLISHED';
