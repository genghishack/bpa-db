import {pgQuery} from "../../lib/postgres.js";
import {dropAllParentChildTablesInSchema, dropAllTablesInSchema} from "../../lib/sql.js";
import {LayerSchemaOptions, LayerTableOptions, Migration} from "../../types/migrate.js";

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

  if (migrateUserOpts.clear) {
    await dropAllTablesInSchema(`${schema}_staging`);
    await dropAllParentChildTablesInSchema(`${schema}_data`, schema);
    await dropAllParentChildTablesInSchema(`${schema}`);
    await dropAllTablesInSchema(`${schema}`);
  }

  const sqlToCreateLayerSchemas = await (getSQLToCreateLayerSchemas(schema));

  return {
    seq, label, sql: `
    ${sqlToCreateLayerSchemas}
    ${getSQLToConfigureLayerSchemas(options)}
  `
  };
}

const getSQLForParentGeomTable = (
  options: LayerTableOptions,
) => {
  const {schema, tableName, pk} = options;
  return `
      DROP TABLE IF EXISTS ${schema}.geom_${tableName};
      CREATE TABLE ${schema}.geom_${tableName}
      (
          ${pk}            UUID UNIQUE NOT NULL,
          shape_corrected  geometry,
          shape_geojson    JSONB,
          centroid         geometry,
          centroid_geojson JSONB,
          centroid_lat     DOUBLE PRECISION,
          centroid_lng     DOUBLE PRECISION,
          pluscode         CHARACTER VARYING(20),
          PRIMARY KEY (${pk}),
          FOREIGN KEY (${pk})
              REFERENCES ${schema}.${tableName} (${pk})
              ON DELETE CASCADE
      );
      CREATE INDEX idx_pk_geom_${tableName}
          ON ${schema}.geom_${tableName} (${pk});
      CREATE INDEX idx_shape_geom_${tableName}
          ON ${schema}.geom_${tableName}
              USING gist (shape_corrected);
      CREATE INDEX idx_centroid_geom_${tableName}
          ON ${schema}.geom_${tableName}
              USING gist (centroid);
  `
}

export const getSQLForChildGeomTable = (
  options: LayerTableOptions,
) => {
  const {schema, tableName, parentTable, pk} = options;
  const geomTableName = `geom_${tableName}`;
  const geomParentTableName = `geom_${parentTable}`;
  return `
      DROP TABLE IF EXISTS ${schema}.${geomTableName};
      CREATE TABLE ${schema}.${geomTableName}
      (
          LIKE ${schema}.${geomParentTableName} INCLUDING ALL
      ) INHERITS (${schema}.${geomParentTableName});
      CREATE INDEX idx_pk_${geomTableName}
          ON ${schema}.${geomTableName} (${pk});
  `
}

export const getSQLForGeomIndex = (
  options: LayerTableOptions
) => {
  const {schema, tableName} = options;
  return `
      CREATE INDEX idx_shape_${tableName}
          ON ${schema}.${tableName}
              USING gist (shape);
  `;
}

export const getSQLForPKIndex = (
  options: LayerTableOptions
) => {
  const {schema, tableName, pk} = options;
  return `
      CREATE INDEX idx_pk_${tableName}
          ON ${schema}.${tableName} (${pk});
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
                    ${hasGeom ? 'shape_invalid boolean,' : ''} ${keys.join(',')}${hasGeom ? ',' : ''}
                  ${hasGeom ? getSQLForGeomConstraints(options) : ''}
          );
          COMMENT
              ON TABLE
              ${schema}
                  .
                  ${tableName}
              IS
                      '${options.layerDesc}';
          ${getSQLForPKIndex(options)}
          ${hasGeom ? getSQLForGeomIndex(options) : ''}
          ${hasGeom ? getSQLForParentGeomTable(options) : ''}
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
  const label = `delete migration ${sequence} for module ${module}`;
  const sql = `
      DELETE
      FROM layer_mgt.db_migrate
      WHERE sequence = ${sequence}
        AND module = '${module}'
  `;
  return pgQuery(sql, [], label);
}

export const registerMigration = async (
  sequence: number,
  migrationLabel: string,
  module: string,
  result: any
) => {
  const label = 'register migration';
  const sql = `
      INSERT INTO layer_mgt.db_migrate (sequence, label, module, result)
      VALUES (${sequence}, '${migrationLabel}', '${module}', '${JSON.stringify(result)}')
  `;
  await pgQuery(sql, [], label);
}

export const getSQLToCreateLayerSchemas = async (schema: string) => {
  const sql = `
      DELETE
      FROM layer_mgt.schema
      WHERE base_schema = '${schema}';

      DROP SCHEMA IF EXISTS ${schema}_staging CASCADE;
      CREATE SCHEMA ${schema}_staging;

      DROP SCHEMA IF EXISTS "${schema}_data" CASCADE;
      CREATE SCHEMA "${schema}_data";

      DROP SCHEMA IF EXISTS ${schema} CASCADE;
      CREATE SCHEMA ${schema};
  `;
  // log.info(sql);
  return sql;
}

export const getSQLToConfigureLayerSchemas = (options: LayerSchemaOptions) => {
  const {steward, schema, web_root, ftp_root, base_path} = options;
  return `
      WITH ensure_creation_of_steward AS (
          INSERT
              INTO layer_mgt.steward (steward_name)
                  VALUES ('${steward}')
                  ON CONFLICT (steward_name)
                      DO
                          UPDATE
                          SET steward_name = EXCLUDED.steward_name
                  RETURNING id
      )
      INSERT
      INTO layer_mgt.schema
      (steward_id, base_schema, data_schema, staging_schema, web_root, ftp_root, base_path)
      VALUES ((SELECT id FROM ensure_creation_of_steward),
              '${schema}',
              '${schema}_data',
              '${schema}_staging',
              '${web_root}',
              '${ftp_root}',
              '${base_path}')
      ON CONFLICT (base_schema)
          DO UPDATE SET data_schema    = '${schema}_data',
                        staging_schema = '${schema}_staging',
                        web_root       = '${web_root}',
                        ftp_root       = '${ftp_root}',
                        base_path      = '${base_path}'
      ;
  `;
}

export const getSQLToConfigureLayerTable = (options: LayerTableOptions) => {
  const {
    schema,
    tableName,
    pk,
    layerName,
    layerDesc,
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
      INSERT INTO layer_mgt.layer (schema_id,
                                   layer_name,
                                   layer_desc,
                                   table_name,
                                   pk_name,
                                   load,
                                   level_county,
                                   level_state,
                                   level_nation,
                                   columns_exclude)
      VALUES ((SELECT id from layer_mgt.schema s WHERE s.base_schema = '${schema}'),
              '${layerName}',
              '${layerDesc}',
              '${tableName}',
              '${pk}',
              ${load},
              ${level.county},
              ${level.state},
              ${level.nation},
              ${columns_exclude.length ? `'${sColumnsExclude}'` : 'NULL'})
      ON CONFLICT
          ON CONSTRAINT layer_schema_id_table_name_key
          DO UPDATE SET pk_name         = '${pk}',
                        layer_name      = '${layerName}',
                        load            = ${load},
                        level_county    = ${level.county},
                        level_state     = ${level.state},
                        level_nation    = ${level.nation},
                        columns_exclude = ${columns_exclude.length ? `'${sColumnsExclude}'` : 'NULL'}
      RETURNING id;
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
    if (typeof (type) === 'string') {
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

export const performMigration = async (
  migration: Migration,
  lastCompleted: number,
  module: string | null
) => {
  const moduleName = (module) ? module : 'core';
  const {label, seq, sql} = migration;
  // log.info({seq})
  if (seq > lastCompleted) {
    try {
      // perform migration
      const result = await pgQuery(sql, [], label);
      // record migration in migration table
      await registerMigration(seq, label, moduleName, result);
      log.info(`${seq}: Complete (${label})`);
    } catch (e) {
      return Promise.reject(e);
    }
  } else {
    log.info(`${seq}: Skipped (${label})`);
  }
  return Promise.resolve()
}
