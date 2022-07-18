import {Layer, LayerOptions} from "../types/etl.js";
import {logDebug} from "./logging.js";
import {pgQuery} from "./postgres.js";

export const resetSchema = async (schema: string) => {
  const label = `reset schema ${schema}`;
  const sql = `
    DROP SCHEMA IF EXISTS ${schema} CASCADE;
    CREATE SCHEMA ${schema};
  `;
  return pgQuery(sql, [], label)
}

export const getStateInfoFromAbbrev = async (stateAbbrev: string) => {
  const label: string = 'get state info from abbreviation';
  const sql: string = `
    SELECT name, abbrev, statefp AS fips
    FROM layer_mgt.state_lookup
    WHERE abbrev = $1;
  `;
  const params: string[] = [stateAbbrev.toUpperCase()];
  if (stateAbbrev === 'us') {
    return {
      name: 'United States',
      abbrev: 'us',
      fips: 'us',
    }
  }
  try {
    const [stateInfo] = await pgQuery(sql, params, label);
    // TODO handle when state not found for abbreviation
    // logDebug({stateInfo});
    return stateInfo;
  } catch (e) {
    return Promise.reject(e);
  }
}

const createDataTable = async (
  opts: LayerOptions
) => {
  console.log(`Creating ${opts.layer.name} data table (${opts.schema.data}.${opts.layer.table})...`);
  const label = `create ${opts.layer.table} data table`;
  const sql = `
    DROP TABLE IF EXISTS ${opts.schema.data}.${opts.layer.table} CASCADE;
    CREATE TABLE ${opts.schema.data}.${opts.layer.table}
    (
      LIKE ${opts.schema.base}.${opts.layer.parentTable} INCLUDING ALL
    ) 
    INHERITS(${opts.schema.base}.${opts.layer.parentTable});
  `;
  return pgQuery(sql, [], label);
}

const createGeomDataTable = async (
  opts: LayerOptions
) => {
  const geomTableExists = await checkTableExists(opts.schema.base, `${opts.layer.parentTable}_geom`);
  if (!geomTableExists) return null;

  console.log(`Creating secondary geom table for (${opts.schema.data}.${opts.layer.table})...`);
  const label = `create ${opts.layer.table}_geom data table`;
  const sql = `
    DROP TABLE IF EXISTS ${opts.schema.data}.${opts.layer.table}_geom;
    CREATE TABLE ${opts.schema.data}.${opts.layer.table}_geom
    (
      LIKE ${opts.schema.base}.${opts.layer.parentTable}_geom INCLUDING ALL
    ) 
    INHERITS(${opts.schema.base}.${opts.layer.parentTable}_geom);
    ALTER TABLE ${opts.schema.data}.${opts.layer.table}_geom
        ADD CONSTRAINT ${opts.layer.table}_primary_id_fkey
        FOREIGN KEY(primary_id)
        REFERENCES ${opts.schema.data}.${opts.layer.table}(${opts.layer.pk})
        ON DELETE CASCADE;
  `;
  return pgQuery(sql, [], label);
}

export const createDataTables = async (
  opts: LayerOptions
) => {
  await createDataTable(opts);
  await createGeomDataTable(opts);
}

// TODO: deprecated - phase out
export const oldCreateDataTable = async (
  parentTableName: string,
  opts: LayerOptions
) => {
  console.log(`Creating ${opts.layer.name} data table (${opts.schema.data}.${opts.layer.table})...`);
  const label = `create ${opts.layer.table} data table`;
  const sql = `
    DROP TABLE IF EXISTS ${opts.schema.data}.${opts.layer.table};
    CREATE TABLE ${opts.schema.data}.${opts.layer.table}
    (
      LIKE ${opts.schema.base}.${parentTableName} INCLUDING ALL
--      CONSTRAINT pk_${opts.layer.table} PRIMARY KEY (${opts.layer.pk})
    ) 
    INHERITS(${opts.schema.base}.${parentTableName});
  `;
  return pgQuery(sql, [], label);
}

export const getLoaderConfigForSchema = async (schema: string) => {
  const label = `get loader config for schema ${schema}`;
  const sql = `
    SELECT base_schema, data_schema, staging_schema, web_root, ftp_root, base_path
    FROM layer_mgt.layer_config_schema
    WHERE base_schema = '${schema}';
  `;
  return pgQuery(sql, [], label);
}

export const getTableConfigForSchemaAndState = async (
  schema: string,
  state: string,
  layerName: string|null = null) => {
  const label = `get layers for ${schema} - ${state}`;
  const rWhereClause = [
    `WHERE schema_name = '${schema}'`,
  ];
  if (state === 'us') {
    rWhereClause.push(
      'AND level_nation = true'
    );
  } else {
    rWhereClause.push(
      'AND (level_state = true OR level_county = true)'
    );
  }
  if (layerName) {
    rWhereClause.push(
      `AND LOWER(layer_name) = '${layerName}'`
    )
  } else {
    rWhereClause.push(
      'AND load = true'
    )
  }
  const sql = `
    SELECT table_name, pk_name, layer_name, level_county, level_state, level_nation 
    FROM layer_mgt.layer_config_table
    ${rWhereClause.join(' ')}
    ;
  `;
  return pgQuery(sql, [], label);
}

export const checkTableExists = async (
  schemaName: string,
  tableName: string,
) => {
  const label = `check that table ${schemaName.toLowerCase()}.${tableName.toLowerCase()} exists`;
  const sql = `
      SELECT EXISTS(
                     SELECT
                     FROM pg_tables
                     WHERE schemaname = '${schemaName.toLowerCase()}'
                       AND tablename = '${tableName.toLowerCase()}'
                 );
  `;
  const result: any = await pgQuery(sql, [], label);
  logDebug({result});
  return result[0].exists;
}