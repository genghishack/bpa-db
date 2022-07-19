import {pgQuery} from "../../lib/postgres.js";

export const getStateInfoFromAbbrev = async (stateAbbrev: string) => {
  const label = 'get state info from abbreviation';
  const sql = `
    SELECT name, abbrev, statefp AS fips
    FROM layer_mgt.state
    WHERE abbrev = $1;
  `;
  const params = [stateAbbrev.toUpperCase()];
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
    return stateInfo;
  } catch (e) {
    return Promise.reject(e);
  }
}

export const getTableConfigForSchemaAndState = async () => {
  const schema = loaderOpts.schema.base;
  const state = loaderOpts.state.abbrev;
  const layerName = loaderOpts.user.layer;
  const label = `get layers for ${schema} - ${state}`;
  const rWhereClause = [
    `WHERE s.base_schema = '${schema}'`,
  ];
  if (state === 'us') {
    rWhereClause.push(
      'AND l.level_nation = true'
    );
  } else {
    rWhereClause.push(
      'AND (l.level_state = true OR l.level_county = true)'
    );
  }
  if (layerName) {
    rWhereClause.push(
      `AND LOWER(l.layer_name) = '${layerName}'`
    )
  } else {
    rWhereClause.push(
      'AND l.load = true'
    )
  }
  const sql = `
      SELECT l.table_name, l.pk_name, l.layer_name, l.level_county, l.level_state, l.level_nation
      FROM layer_mgt.layer l
          LEFT JOIN layer_mgt.schema s ON (l.schema_id = s.id)
          ${rWhereClause.join(' ')}
      ;
  `;
  return pgQuery(sql, [], label, true);
}

export const listStates = async () => {
  const label = 'get list of states';
  const sql = `
    SELECT name, abbrev, statefp AS fips
    FROM layer_mgt.state
  `;
  const params: string[] = [];
  const states = await pgQuery(sql, params, label);
  return [...states, {
    name:   'United States',
    abbrev: 'us',
    fips:   'us',
  }];
}

export const resetSchema = async (schema: string) => {
  const label = `reset schema ${schema}`;
  const sql = `
    DROP SCHEMA IF EXISTS ${schema} CASCADE;
    CREATE SCHEMA ${schema};
  `;
  return pgQuery(sql, [], label)
}

export const getLoaderConfigForSchema = async (schema: string) => {
  const label = `get loader config for schema ${schema}`;
  const sql = `
    SELECT base_schema, data_schema, staging_schema, web_root, ftp_root, base_path
    FROM layer_mgt.schema
    WHERE base_schema = '${schema}';
  `;
  return pgQuery(sql, [], label);
}
