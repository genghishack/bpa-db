import {runConsecutively} from "../db/lib/iterate.js";
import {idObj} from "../types/general.js";
import {pgQuery} from "./postgres.js";

export const checkFieldExistsInTable = async (
  schemaName: string,
  tableName: string,
  fieldName: string,
) => {
  const label = `check that field '${fieldName.toLowerCase()}' exists in table ${schemaName.toLowerCase()}.${tableName.toLowerCase()}`;
  const sql = `
      SELECT EXISTS(
                     SELECT
                     FROM information_schema.columns
                     WHERE table_schema = '${schemaName.toLowerCase()}'
                       AND table_name = '${tableName.toLowerCase()}'
                       AND column_name = '${fieldName.toLowerCase()}'
                 );
  `;
  const result: any = await pgQuery(sql, [], label);
  // log.debug({result});
  return result[0].exists;
}

export const getFieldsFromTable = async (
  schema: string,
  table: string,
  excludedColumns: string[] = [],
  sortAlpha: boolean = false
) => {
  const label = `Get fields from ${schema}.${table.toLowerCase()} ${(sortAlpha) ? 'in alphabetical order' : ''}`;
  const sql = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = '${table.toLowerCase()}'
        AND table_schema = '${schema}'
        AND column_name NOT IN ('${excludedColumns.join("','")}')
          ${(sortAlpha) ? 'ORDER BY column_name' : ''}
  `
  const result = await pgQuery(sql, [], label, false)
  // log.info({result});

  return result.map((obj: any) => {
    return obj.column_name;
  })
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
  // log.debug({result});
  return result[0].exists;
}

export const getRowCount = async (
  schemaName: string,
  tableName: string,
) => {
  const label = `get row count for ${schemaName.toLowerCase()}.${tableName.toLowerCase()}`;
  const sql = `
      SELECT count(*)
      FROM ${schemaName.toLowerCase()}.${tableName.toLowerCase()}
  `;
  const result: any = await pgQuery(sql, [], label);
  return result[0].count;
}

export const getAllTablesInSchema = async (
  schemaName: string,
) => {
  const label = `get all tables in schema ${schemaName}`;
  const params = [schemaName];
  const sql = `SELECT tablename
               FROM pg_tables
               WHERE schemaname = $1`;
  // log.info({sql, params, label});
  return pgQuery(sql, params, label, false);
}

const getAllChildTablesInSchema = async (
  childSchemaName: string,
  parentSchemaName: string,
) => {
  const label = `get all child tables in schema ${childSchemaName} of parent ${parentSchemaName}`;
  const params = [childSchemaName, parentSchemaName];
  const sql = `
      SELECT cn.nspname AS schema_child,
             c.relname  AS tablename,
             pn.nspname AS schema_parent,
             p.relname  AS parentname
      FROM pg_inherits
               JOIN pg_class AS c ON (inhrelid = c.oid)
               JOIN pg_class as p ON (inhparent = p.oid)
               JOIN pg_namespace pn ON pn.oid = p.relnamespace
               JOIN pg_namespace cn ON cn.oid = c.relnamespace
      WHERE cn.nspname = $1
        AND pn.nspname = $2
  `
  return pgQuery(sql, params, label, false);
}

const getAllParentTablesWithinSchema = async (
  schemaName: string,
) => {
  const label = `get all parent tables within schema ${schemaName}`;
  const params = [schemaName];
  const sql = `
      SELECT p.relname AS tablename
      FROM pg_inherits
               JOIN pg_class AS c ON (inhrelid = c.oid)
               JOIN pg_class as p ON (inhparent = p.oid)
               JOIN pg_namespace pn ON pn.oid = p.relnamespace
               JOIN pg_namespace cn ON cn.oid = c.relnamespace
      WHERE cn.nspname = $1
        AND pn.nspname = $1
      GROUP BY p.relname;
  `
  return pgQuery(sql, params, label, false);
}

export const dropAllTablesInSchema = async (
  schemaName: string,
) => {
  log.info(`dropping all tables in schema ${schemaName}...`);

  const tables = await getAllTablesInSchema(schemaName);

  log.debug(tables);
  if (tables.length) {
    await iterativelyDropTables(schemaName, tables);
  }
}

export const dropAllParentChildTablesInSchema = async (
  schemaName: string,
  parentSchemaName: string | null = null,
) => {
  log.info(`dropping parent/child tables in schema ${schemaName}...`);

  let tables: any[] = []
  if (parentSchemaName) {
    tables = await getAllChildTablesInSchema(schemaName, parentSchemaName);
  } else {
    tables = await getAllParentTablesWithinSchema(schemaName);
  }

  if (tables.length) {
    await iterativelyDropTables(schemaName, tables);
  }
}

export const iterateWithGroupedSQL = async (
  array: any[],
  groupSize: number,
  label: string,
  callback: Function,
  debug: boolean = false
) => {
  let i = 0;
  let iStart = 1;
  const total = array.length;
  let group: any[] = [];

  await runConsecutively(array, async (obj: any) => {
    i++;
    if (i <= total) {
      group.push(obj);
    }
    if (i % groupSize === 0 || i === array.length) {
      const appendedLabel = `${label} (${iStart} - ${i} of ${total})`;
      const rSQL = group.map((item: any) => {
        return callback(item);
      })
      group = [];
      iStart = i + 1;
      const sql = rSQL.join('\n');
      await pgQuery(sql, [], appendedLabel, debug);
    }
  })
}

export const iterativelyDropTables = async (
  schemaName: string,
  tables: any,
) => {

  const groupSize = 100;
  const label = `drop tables in ${schemaName}`;

  if (tables.length) {
    await iterateWithGroupedSQL(tables, groupSize, label, (obj: any) => {
      log.debug(obj);
      return `DROP TABLE ${schemaName}.${obj.tablename} CASCADE;`
    });
  }
}

export const createChildTable = async (
  childSchemaName: string,
  childTableName: string,
  parentSchemaName: string,
  parentTableName: string,
  debug: boolean = false
) => {
  log.info(`Creating ${childSchemaName}.${childTableName} as child table of ${parentSchemaName}.${parentTableName}`);
  const label = `create ${childSchemaName}.${childTableName} child table`;
  const sql = `
      DROP TABLE IF EXISTS ${childSchemaName}.${childTableName} CASCADE;
      CREATE TABLE ${childSchemaName}.${childTableName}
      (
          LIKE ${parentSchemaName}.${parentTableName} INCLUDING ALL
      ) INHERITS (${parentSchemaName}.${parentTableName});
  `;
  return pgQuery(sql, [], label, debug);
}

export const insertIdsIntoTable = async (
  schema: string,
  table: string,
  idField: string = 'id',
  ids: idObj[]
) => {
  const label = `create id rows in ${schema}.${table}`;
  const rValues = ids.map((idObj: idObj) => {
    return `('${idObj.id}')`;
  })
  const sql = `
    INSERT INTO ${schema}.${table} (${idField}) VALUES ${rValues.join(',')};
  `
  return pgQuery(sql, [], label, false);
}

export const getAllIdsFromTable = async (
  schema: string,
  table: string,
  idField: string = 'id'
) => {
  const label = `get all ids from ${schema}.${table}`;
  const sql = `
    SELECT ${idField} FROM ${schema}.${table};
  `;
  return pgQuery(sql, [], label, false);
}

export const addPKIndexToTable = async (
  schema: string,
  table: string,
  pkField: string = 'id'
) => {
  log.info(`Adding primary key index to ${schema}.${table}`);
  const label = `create PK index on ${schema}.${table}`;
  const sql = `
    CREATE INDEX idx_pk_${table} ON ${schema}.${table}(${pkField});
  `;
  await pgQuery(sql, [], label, false);
}

export const addUniqueIndexToTable = async (
  schema: string,
  table: string,
  uniqueField: string,
) => {
  log.info(`Adding unique index to ${schema}.${table}`);
  const label = `create unique index on ${schema}.${table}`;
  const sql = `
    CREATE INDEX uidx_${uniqueField}_${table} ON ${schema}.${table}(${uniqueField});
  `;
  await pgQuery(sql, [], label, false);
}

export const addGeomIndexToTable = async (
  schema: string,
  table: string,
  geomField: string = 'shape'
) => {
  log.info(`Adding geom field index to ${schema}.${table}`);
  const label = `create geom index on ${schema}.${table}`;
  const sql = `
    CREATE INDEX idx_${geomField}_${table}
        ON ${schema}.${table}
            USING gist (${geomField});
  `
  await pgQuery(sql, [], label, false);
}

export const addForeignKeyToTable = async (
  schema: string,
  table: string,
  field: string,
  refSchema: string,
  refTable: string,
  refField: string
) => {
  log.info(`Adding foreign key from ${schema}.${table}.${field} to ${refSchema}.${refTable}.${refField}`);
  const label = `add fk from ${schema}.${table}.${field} to ${refSchema}.${refTable}.${refField}`;
  const sql = `
      ALTER TABLE ${schema}.${table}
          ADD CONSTRAINT fkey_${table}_${field}
          FOREIGN KEY (${field})
          REFERENCES ${refSchema}.${refTable}(${refField})
          ON
      DELETE
      CASCADE;
  `;
  return pgQuery(sql, [], label, false);
}
