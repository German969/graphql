import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { schema } from './schema.js';
import { createRootValue } from './resolvers.js';

const app = express();
const PORT = 4000;

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    rootValue: createRootValue(),
    graphiql: true,
  })
);

app.listen(PORT, () => {
  console.log(`GraphQL server at http://localhost:${PORT}/graphql`);
  console.log('Open GraphiQL in the browser to run queries.');
});
