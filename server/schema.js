import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { buildSchema } from 'graphql';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, 'schema.graphql');

/**
 * Schema is the contract: what clients can ask for.
 * Loaded from schema.graphql so the GraphQL extension can use the same file.
 */
export const schema = buildSchema(readFileSync(schemaPath, 'utf-8'));
