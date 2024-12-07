import { readFileSync } from 'fs';
import { join } from 'path';

// Load GraphQL type definitions from .graphql files
const loadGraphQLFile = (filename: string) => {
  return readFileSync(join(__dirname, 'typeDefs', filename), 'utf8');
};

// Load all type definitions
const types = {
  base: loadGraphQLFile('base.graphql'),
  user: loadGraphQLFile('user.graphql'),
  car: loadGraphQLFile('car.graphql'),
  admin: loadGraphQLFile('admin.graphql')
};

// Export combined type definitions
export const typeDefs = Object.values(types).join('\n');