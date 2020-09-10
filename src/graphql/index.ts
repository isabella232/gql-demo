import * as path from 'path';
import { importSchema } from 'graphql-import';
import Resolvers from './resolvers';

export const resolvers = Resolvers;
export const typeDefs = importSchema(path.join(__dirname, './schema.graphql'));
