const messages = [];

/**
 * Resolvers implement the schema: each field gets a function
 * that returns the value for that field.
 * Query and Mutation both use this same root object.
 */
export function createRootValue() {
  return {
    hello() {
      return 'Hello, GraphQL!';
    },
    now() {
      return new Date().toISOString();
    },
    messages() {
      return [...messages];
    },
    addMessage({ text }) {
      messages.push(text);
      return text;
    },
  };
}
