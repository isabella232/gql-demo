import { pgFirstOrDefault, pgQuery } from '../db/pgPool';
import { getAllBooks } from './pgQueries';
import { mapPgBookToGqlSchema } from './schemaMappers';

const allBooks = async () => {
    return (await pgQuery(getAllBooks())).map(mapPgBookToGqlSchema);
}

export const allBooksObject = () => { return allBooks() };
