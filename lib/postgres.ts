import pg from 'pg';
import {logDebug, logError} from './logging.js';

export const getPGConnectionStr = () => {
  const {PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD} = process.env;
  //@ts-ignore
  const encodedPasswd = encodeURIComponent(PGPASSWORD);
  const pgConnStr = `postgres://${PGUSER}:${encodedPasswd}@${PGHOST}:${PGPORT}/${PGDATABASE}`;
  // logDebug({pgConnStr});
  return pgConnStr;
}

export const getGDALPGConnectionStr = () => {
  const {PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD} = process.env;
  return `host=${PGHOST} port=${PGPORT} dbname=${PGDATABASE} user=${PGUSER} password=${PGPASSWORD}`
}

const getPgClient = async () => {
  const pgConnectionString = getPGConnectionStr();
  try {
    const pgClient = new pg.Client(pgConnectionString);
    return Promise.resolve(pgClient);
  } catch (e) {
    return Promise.reject(new Error('Unable to create DB client'));
  }
};

export const pgQuery = async (
  sql: string,
  parameters:string[] = [],
  sqlLabel: string,
  debug: boolean = false
) => {
  if (!sql) {
    return Promise.reject(new Error('No SQL provided for query'));
  }
  const label = (sqlLabel) ? `SQL query: ${sqlLabel}` : 'SQL query';
  logDebug(label);
  if (debug) logDebug({sql, parameters});

  let pgClient = {
    connect: () => {},
    query: (a: any, b: any) => { return {rows: []}},
    end: () => {}
  };

  try {
    pgClient = await getPgClient();
    pgClient.connect();
    const result = await pgClient.query(sql, parameters);
    // logDebug({result});
    return result.rows;
  } catch (e) {
    logError(e);
    return Promise.reject(e);
  } finally {
    pgClient.end();
  }
};

export const pgCleanString = (string: string) => {
  // console.log({string})
  return string ? string.replace(/'/g, "''") : null;
}

export const pgCleanFieldName = (fieldName: string) => {
  let newFieldName = fieldName;
  newFieldName = newFieldName.replace(/\./g, '_');
  newFieldName = newFieldName.replace(/\(/, '_');
  newFieldName = newFieldName.replace(/\)/, '_');
  return newFieldName;
}
