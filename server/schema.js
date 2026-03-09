import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { buildSchema } from 'graphql';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaDir = join(__dirname, 'schema');

const schemaFiles = ['base.graphql', 'user.graphql', 'post.graphql', 'admin.graphql'];
const typeDefs = schemaFiles
  .map((file) => readFileSync(join(schemaDir, file), 'utf-8'))
  .join('\n');

/**
 * Schema is built from separate files per domain (base, user, post).
 * typeDefs: raw SDL string for Apollo Server.
 */
export { typeDefs };
export const schema = buildSchema(typeDefs);
