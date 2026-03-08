import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers/index.js';

const PORT = 4000;

const server = new ApolloServer({ typeDefs, resolvers });

async function start() {
  await server.start();

  const app = express();
  app.use(
    '/graphql',
    cors(),
    express.json(),
    expressMiddleware(server)
  );

  app.listen(PORT, () => {
    console.log(`GraphQL server at http://localhost:${PORT}/graphql`);
    console.log('Apollo Server ready.');
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
