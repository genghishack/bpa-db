const tableConfig = require('../lib/tableConfig.json');
const postgres = require('../lib/postgres');

const {pgQuery} = postgres;

const {
  migrate: {main: tableName_migrate},
  populate: {main: tableName_populate},
} = tableConfig;

module.exports = {
  checkMigrationTableExists: async () => {
    return (await pgQuery(`
    SELECT EXISTS (
      SELECT FROM pg_tables
      WHERE schemaname = '${process.env.DB_SCHEMA}'
      AND tableName = '${tableName_migrate}'
    );
  `)).rows[0].exists;
  },

  installUUIDExtension: async () => {
    await pgQuery(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  `);
  },

  createMigrationTable: async () => {
    await pgQuery(`
    CREATE TABLE ${tableName_migrate}
    (
        id UUID default uuid_generate_v1(),
        created_at TIMESTAMP WITH TIME ZONE default CURRENT_TIMESTAMP,
        sequence FLOAT NOT NULL,
        label TEXT,
        result TEXT NOT NULL,
        PRIMARY KEY (id)
    );
  `);
  },

  createPopulationTable: async () => {
    await pgQuery(`
    DROP TABLE IF EXISTS ${tableName_populate};
    CREATE TABLE ${tableName_populate}
    (
        table_name TEXT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE default CURRENT_TIMESTAMP,
        PRIMARY KEY (table_name) 
    );
  `);
  },
}
