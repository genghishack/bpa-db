import {pgQuery} from "../lib/postgres.js";
import {LayerSchemaOptions, LayerTableOptions} from "../types/migrate.js";

export const layerMgtSchemaExists = async () => {
  const label = 'check existence of layer_mgt schema';
  const sql = `
      SELECT EXISTS(
                     SELECT
                     FROM pg_tables
                     WHERE schemaname = 'layer_mgt'
                 );
  `;
  const check: { exists: boolean }[] = await pgQuery(sql, [], label);
  return check[0].exists;
}

export const dbMigrateTableExists = async () => {
  const label = 'check existence of db_migrate table';
  const sql = `
      SELECT EXISTS(
                     SELECT
                     FROM pg_tables
                     WHERE schemaname = 'layer_mgt'
                       AND tablename = 'db_migrate'
                 );
  `;
  const check: { exists: boolean }[] = await pgQuery(sql, [], label);
  return check[0].exists;
}

export const createLayerMgtSchema = async () => {
  const label = 'create layer_mgt schema';
  const sql = `
    DROP SCHEMA IF EXISTS layer_mgt CASCADE;
    CREATE SCHEMA layer_mgt;
  `
  return pgQuery(sql, [], label);
}

export const createDbMigrateTable = async () => {
  const label = 'create db_migrate table';
  const sql = `
      CREATE TABLE layer_mgt.db_migrate
      (
          id         SERIAL PRIMARY KEY,
          sequence   FLOAT NOT NULL,
          label      TEXT,
          module     TEXT,
          result     TEXT  NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE default CURRENT_TIMESTAMP
      );
  `;
  await pgQuery(sql, [], label);
}

export const createLayerSchemas = async (
  options: LayerSchemaOptions,
  seq: number,
) => {
  const {schema} = options;
  const label = `create ${schema} schemas`;

  return {
    seq, label, sql: `
    ${getSQLToCreateLayerSchemas(schema)}
    ${getSQLToConfigureLayerSchemas(options)}
  `
  };
}

const getSQLForSecondaryGeomTable = (
  options: LayerTableOptions,
) => {
  const {schema, tableName, pk} = options;
  return `
    DROP TABLE IF EXISTS ${schema}.${tableName}_geom;
    CREATE TABLE ${schema}.${tableName}_geom
    (
        id UUID DEFAULT uuid_generate_v1(),
        primary_id UUID UNIQUE NOT NULL,
        shape_valid geometry,
        shape_geojson JSONB,
        shape_valid_geojson JSONB,
        PRIMARY KEY (id),
        FOREIGN KEY(primary_id) 
            REFERENCES ${schema}.${tableName}(${pk})
            ON DELETE CASCADE
    );
  `
}

const getSQLForGeomIndex = (
  options: LayerTableOptions
) => {
  const {schema, tableName} = options;
  return `
    CREATE INDEX ${tableName}_shape_idx
    ON ${schema}.${tableName}
    USING gist(shape);
  `;
}

export const createLayerTable = async (
  options: LayerTableOptions,
  columns: string,
  seq: number
) => {
  const {schema, tableName, pk} = options;
  const label = `create ${schema}.${tableName} table`;
  if (!options.columns_exclude.length) {
    options.columns_exclude = [options.pk, 'shape_invalid'];
  }
  const hasGeom = options.geom && options.geom !== 'none';

  const keys = [`PRIMARY KEY (${pk})`];
  options.uidx.forEach((field) => {
    keys.push(`UNIQUE (${field})`);
  })

  return {
    seq, label, sql: `
          DROP TABLE IF EXISTS ${schema}.${tableName} CASCADE;
          CREATE TABLE
              ${schema}.${tableName}
          (
              ${pk} UUID DEFAULT uuid_generate_v1(),
              ${columns}
              ${hasGeom ? 'shape_invalid boolean,' : ''}
              ${keys.join(',')}${hasGeom ? ',' : ''}
              ${hasGeom ? getSQLForGeomConstraints(options) : ''}
          );
          COMMENT ON TABLE ${schema}.${tableName} IS '${options.layerDesc}';
          ${hasGeom ? getSQLForGeomIndex(options) : ''}
          ${hasGeom ? getSQLForSecondaryGeomTable(options) : ''}
          ${getSQLToConfigureLayerTable(options)}
    `
  }
}

export const getLastCompletedMigration = async (seqNumbers: number[], module: string | null = null) => {
  const label = 'get last completed migration';
  const moduleName = (module) ? module : 'core';
  const sql = `
      SELECT MAX(sequence)
      FROM layer_mgt.db_migrate
      WHERE sequence IN (${seqNumbers.join(',')})
        AND module = '${moduleName}'
  `;
  try {
    const lastCompleted: { max: number }[] = await pgQuery(sql, [], label);
    return lastCompleted[0].max || -1;
  } catch (e) {
    return Promise.reject(e);
  }
}

export const clearModuleMigrations = async (module: string) => {
  const label = `clear migrations for module ${module}`;
  const sql = `
      DELETE
      FROM layer_mgt.db_migrate
      WHERE module = '${module}';
  `;
  try {
    await pgQuery(sql, [], label);
  } catch (e) {
    return Promise.reject(e);
  }
}

export const clearAllMigrations = async () => {
  const label = 'clear all migrations';
  const sql = 'TRUNCATE TABLE layer_mgt.db_migrate;';
  try {
    await pgQuery(sql, [], label);
  } catch (e) {
    return Promise.reject(e);
  }
}

export const clearMigrationsFromSequence = async (
  clearFrom: number,
  module: string | null
) => {
  const moduleName = (module) ? module : 'core';
  const label = `clear migrations from sequence ${clearFrom} for ${module}`;
  const sql = `
      SELECT sequence
      FROM layer_mgt.db_migrate
      WHERE sequence >= ${clearFrom}
        AND module = '${moduleName}'
  `;
  try {
    const rowsToClear = (await pgQuery(sql, [], label));
    return Promise.all(rowsToClear.map(async (row: { sequence: number }) => {
      return deleteMigration(row.sequence, moduleName);
    }))
  } catch (e) {
    return Promise.reject(e);
  }
}

const deleteMigration = async (
  sequence: number,
  module: string
) => {
  const deletionLabel = `delete migration ${sequence} for module ${module}`;
  const deletionSQL = `
      DELETE
      FROM layer_mgt.db_migrate
      WHERE sequence = ${sequence}
        AND module = '${module}'
  `;
  return pgQuery(deletionSQL, [], deletionLabel);
}

export const registerMigration = async (
  sequence: number,
  label: string,
  module: string,
  result: any
) => {
  const sql = `
      INSERT INTO layer_mgt.db_migrate (sequence, label, module, result)
      VALUES (${sequence}, '${label}', '${module}', '${JSON.stringify(result)}')
  `;
  await pgQuery(sql, [], 'register migration');
}

export const getSQLToCreateLayerSchemas = (schema: string) => {
  return `
      DELETE
      FROM layer_mgt.layer_metadata
      WHERE layer_instance_id IN (
          SELECT layer_instance_id
          FROM layer_mgt.layer_instance
          WHERE parent_schema = '${schema}'
      );
      DELETE
      FROM layer_mgt.layer_instance
      WHERE parent_schema = '${schema}';
      UPDATE layer_mgt.layer
      SET schema_name = NULL,
          table_name  = NULL
      WHERE schema_name = '${schema}';
      DELETE
      FROM layer_mgt.layer_config_table
      WHERE schema_name = '${schema}';
      DROP SCHEMA IF EXISTS ${schema} CASCADE;
      CREATE SCHEMA ${schema};
      DROP SCHEMA IF EXISTS ${schema}_data CASCADE;
      CREATE SCHEMA ${schema}_data;
      DROP SCHEMA IF EXISTS ${schema}_staging CASCADE;
      CREATE SCHEMA ${schema}_staging;
  `;
}

export const getSQLToConfigureLayerSchemas = (options: LayerSchemaOptions) => {
  const {schema, web_root, ftp_root, base_path} = options;
  return `
      INSERT INTO layer_mgt.layer_config_schema
      (base_schema, data_schema, staging_schema, web_root, ftp_root, base_path)
      VALUES ('${schema}',
              '${schema}_data',
              '${schema}_staging',
              '${web_root}',
              '${ftp_root}',
              '${base_path}') ON CONFLICT
      ON CONSTRAINT layer_config_schema_pkey
          DO
      UPDATE SET data_schema = '${schema}_data',
          staging_schema = '${schema}_staging',
          web_root = '${web_root}',
          ftp_root = '${ftp_root}',
          base_path = '${base_path}'
      ;
  `;
}

export const getSQLToConfigureLayerTable = (options: LayerTableOptions) => {
  const {
    schema,
    tableName,
    pk,
    layerName,
    load,
    level,
    columns_exclude
  } = options;
  let sColumnsExclude = '';
  if (columns_exclude.length) {
    const rColumnsExclude: string[] = [];
    columns_exclude.forEach((columnName) => {
      rColumnsExclude.push(`"${columnName}"`);
    })
    sColumnsExclude = `{${rColumnsExclude.join(',')}}`;
  }
  return `
      INSERT INTO layer_mgt.layer_config_table (schema_name,
                                                table_name,
                                                pk_name,
                                                layer_name,
                                                load,
                                                level_county,
                                                level_state,
                                                level_nation,
                                                columns_exclude)
      VALUES ('${schema}',
              '${tableName}',
              '${pk}',
              '${layerName}',
              ${load},
              ${level.county},
              ${level.state},
              ${level.nation},
              ${columns_exclude.length ? `'${sColumnsExclude}'` : 'NULL'}) ON CONFLICT
      ON CONSTRAINT layer_config_table_schema_name_table_name_key
          DO
      UPDATE SET pk_name = '${pk}',
          layer_name = '${layerName}',
          load = ${load},
          level_county = ${level.county},
          level_state = ${level.state},
          level_nation = ${level.nation},
          columns_exclude = ${columns_exclude.length ? `'${sColumnsExclude}'` : 'NULL'}
      ;
  `
}

export const getSQLForGeomConstraints = (options: LayerTableOptions) => {
  if (!options.geom || options.geom === 'none') {
    return '';
  }
  const {field, dims, srid, type} = options.geom!;
  let constraints = [];
  if (dims) {
    constraints.push(`
      CONSTRAINT enforce_dims_${field} CHECK (
        st_ndims(${field}) = ${dims}
      )
    `)
  }
  if (srid) {
    constraints.push(`
      CONSTRAINT enforce_srid_${field} CHECK (
        st_srid(${field}) = ${srid}
      )
    `)
  }
  if (type) {
    let geoTypeConstraints = [
      `(${field} IS NULL)`
    ];
    if (typeof(type) === 'string') {
      geoTypeConstraints.push(`
        (geometrytype(${field}) = '${type.toUpperCase()}'::TEXT)
      `)
    } else if (type instanceof Array) {
      type.forEach((geoType) => {
        geoTypeConstraints.push(`
        (geometrytype(${field}) = '${geoType.toUpperCase()}'::TEXT)
      `)
      })
    }
    constraints.push(`
      CONSTRAINT enforce_geotype_${field} CHECK (
        ${geoTypeConstraints.join(' OR ')}
      )
    `)
  }
  return constraints.join(',');
}
