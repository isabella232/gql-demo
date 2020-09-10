import { Pool, PoolConfig, QueryConfig, QueryResult } from 'pg';
import { pgdbName, DbConfigs } from './dbPoolConfig';

export interface PoolOptions {
    globalVar: any;
    createPool: (config: PoolConfig) => Pool;
    logError: (error: any) => void;
    logInfo: (info: any) => void;
  }

  export function createPoolInstance(poolOptions: PoolOptions) {
    const { globalVar, createPool, logError, logInfo } = poolOptions;
  
    function handlePgError(
      queryConfig: InsertConfig | DeleteByIdConfig | QueryResult | DeleteConfig,
      config: PoolConfig,
      error: any
    ) {
      logError('Query Error:');
      logError(error);
      logError(queryConfig);
      logError({
        ...config,
        password: null,
      });
      throw error;
    }
  
    return {
      getPool(dbName = pgdbName): Pool {
        const { cachedDbPools } = globalVar;
  
        if (!cachedDbPools) {
          globalVar.cachedDbPools = {};
        } else if (cachedDbPools[dbName]) {
          return cachedDbPools[dbName];
        }
        debugger;
        const config = DbConfigs[dbName] as PoolConfig;
  
        logInfo(`Creating PgPool for ${dbName}`);
        logInfo({ ...config, password: null });
         
        const newPool = createPool(config);
  
        globalVar.cachedDbPools[dbName] = newPool;
  
        return newPool;
      },
  
      endPoolConnections() {
        // @ts-ignore
        const { cachedDbPools } = globalVar;
        if (cachedDbPools) {
          Object.keys(cachedDbPools).forEach(dbName => {
            logInfo(`shutting db pgsql pool for ${dbName}`);
            cachedDbPools[dbName].end();
          });
        }
      },
  
      async pgQuery(query: QueryConfig, dbName = pgdbName) {
        console.info(`pgQuery ${dbName} ${JSON.stringify(query)}`);
        return this.getPool(dbName)
          .query(query)
          .then((queryResults: QueryResult) => queryResults.rows)
          .catch((e: any) => handlePgError(query, DbConfigs[dbName], e));
      },
  
      async pgFirstOrDefault(query: QueryConfig, dbName = pgdbName) {
        console.info(`pgFirstOrDefault ${dbName} ${JSON.stringify(query)}`);
        return this.getPool(dbName)
          .query(query)
          .then((results: QueryResult) => (results.rows.length > 0 ? results.rows[0] : null))
          .catch((e: any) => handlePgError(query, DbConfigs[dbName], e));
      },
    //TODO: fix below QueryConfig may be different in latest version 
    //   async pgInsert(insertConfig: InsertConfig, dbName = pgdbName) {
    //     console.info(`pgInsert ${dbName} ${insertConfig.text}, ${JSON.stringify(insertConfig.values)}`);
    //     const insertConfigWithReturn = {
    //       ...insertConfig,
    //       text: insertConfig.idColumn ? `${insertConfig.text} RETURNING ${insertConfig.idColumn}` : insertConfig.text,
    //     };
    //     return this.getPool(dbName)
    //       .query(insertConfigWithReturn)
    //       .then((result: QueryResult) =>
    //         result.rows.length > 0 && insertConfig.idColumn
    //           ? { id: parseInt(result.rows[0][insertConfig.idColumn], 10) }
    //           : {}
    //       )
    //       .catch(e => handlePgError(insertConfig, DbConfigs[dbName], e));
    //   },
      async pgDeleteById(deleteByIdConfig: DeleteByIdConfig, dbName = pgdbName) {
        console.warn(`pgDeleteById ${dbName} ${JSON.stringify(deleteByIdConfig)}`);
        const idColumnName = deleteByIdConfig.idColumn ? deleteByIdConfig.idColumn : `${deleteByIdConfig.tableName}id`;
        return this.getPool(dbName)
          .query({
            text: `DELETE FROM ${deleteByIdConfig.tableName} WHERE ${idColumnName} = $1`,
            values: [deleteByIdConfig.id],
          })
          .catch(e => handlePgError(deleteByIdConfig, DbConfigs[dbName], e));
      },
      async pgDelete(deleteConfig: DeleteConfig, dbName = pgdbName) {
        if (!deleteConfig.matches || deleteConfig.matches.length < 1) {
          throw new Error('pgDelete must have at least one match');
        }
        const deleteQueryConfig = deleteConfig.matches.reduce(
          (config, match, index) => ({
            text:
              config.values.length === 0
                ? `${config.text} ${match[0]} = $${index + 1}`
                : `${config.text} AND ${match[0]} = $${index + 1}`,
            values: [...config.values, match[1]],
          }),
          {
            text: `DELETE FROM ${deleteConfig.tableName} WHERE`,
            values: [],
          }
        );
        console.warn(`pgDelete ${dbName} ${deleteQueryConfig.text} ${JSON.stringify(deleteQueryConfig.values)}`);
        return this.getPool(dbName)
          .query(deleteQueryConfig)
          .catch(e => handlePgError(deleteConfig, DbConfigs[dbName], e));
      },
    };
  }
  
  export interface InsertConfig extends QueryConfig {
    idColumn?: string;
  }
  
  export interface DeleteByIdConfig {
    tableName: string;
    id: number;
    idColumn?: string;
  }
  
  export interface DeleteConfig {
    tableName: string;
    matches: [string, any][];
  }
  
  const poolInstance = createPoolInstance({
    globalVar: global,
    createPool: (config: PoolConfig) => new Pool(config),
    logError: args => console.error(args),
    logInfo: args => console.info(args),
  });
  
  export const {
    getPool,
    endPoolConnections,
    pgQuery,
    pgFirstOrDefault,
    // pgInsert, //TODO: fix above
    pgDelete,
    pgDeleteById,
  } = poolInstance;
  