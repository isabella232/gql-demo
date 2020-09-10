// gk: lets leave this default values, I need them to key that dbConfig below.
export const pgdbName = process.env.POSTGRES_DB || 'book-store-demo';

export const DbConfigs = {
  [pgdbName]: {
    user: process.env.POSTGRES_USER || 'postgres',
    host: process.env.POSTGRES_HOST, 
    database: pgdbName,
    password: process.env.PG_PASSWORD,
    port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
    ssl: process.env.POSTGRES_SSL === 'true' || false, //TODO: setup ssl default
    application_name: process.env.APPLICATION_NAME || 'graphql',
    max: parseInt(process.env.MAX_POOLING_SIZE, 10) || 10,
    min: parseInt(process.env.POSTGRES_MIN_POOLING_SIZE, 10) || 1,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  },
};
