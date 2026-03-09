import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers/index.js';
import { BAD_USER_INPUT } from './errors.js';
import { decodeToken } from './auth.js';
import { db } from './db.js';

const PORT = 4000;

const schema = makeExecutableSchema({ typeDefs, resolvers });

const server = new ApolloServer({
  schema,
  formatError(formattedError, error) {
    if (error?.extensions?.code !== BAD_USER_INPUT) {
      console.error('GraphQL error:', error?.message ?? formattedError.message, error?.extensions);
    }
    return formattedError;
  },
});

function buildContextFromAuth(authHeaderOrToken) {
  const token =
    typeof authHeaderOrToken === 'string' && authHeaderOrToken.startsWith('Bearer ')
      ? authHeaderOrToken.slice(7)
      : authHeaderOrToken;
  const decoded = token ? decodeToken(token) : null;
  return { user: decoded, db };
}

async function start() {
  await server.start();

  const app = express();
  const httpServer = createServer(app);

  app.use(
    '/graphql',
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => buildContextFromAuth(req.headers?.authorization),
    })
  );

  const wsServer = new WebSocketServer({ server: httpServer, path: '/graphql' });
  useServer(
    {
      schema,
      context: async (ctx) => {
        const auth =
          ctx.connectionParams?.authorization ?? ctx.connectionParams?.Authorization ?? null;
        return buildContextFromAuth(auth);
      },
    },
    wsServer
  );

  httpServer.listen(PORT, () => {
    console.log(`GraphQL server at http://localhost:${PORT}/graphql`);
    console.log(`WebSocket subscriptions at ws://localhost:${PORT}/graphql`);
    console.log('Apollo Server ready.');
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
