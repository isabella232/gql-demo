import { createFieldMapper, mapField, mapNumberField } from '../mapper/schemaFieldMapper';
import { Book } from './models'

export const mapPgBookToGqlSchema = createFieldMapper<Book>(
    'mapPgBookToGqlSchema',
    [
      mapNumberField('bookid', 'bookId', true),
      mapField('title', 'bookTitle'),
      mapField('author', 'bookAuthor'),
      mapField('instock', 'inStock'),
    ]
  );