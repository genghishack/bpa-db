require('dotenv').config({path: '../.env'});
const fs = require('fs');
const tableConfig = require('../lib/tableConfig.json');
const postgres = require('../lib/postgres');
const setup = require('./setup');

const {pgQuery} = postgres;

const {migrate: {main: tableName_migrate}} = tableConfig;

const migrationPath = './migrations';

const getMigrations = async (path) => {
  const migrateDir = await fs.readdirSync(path);
  const migrations = await Promise.all(migrateDir.map(async (filename) => {
    return require(`${path}/${filename}`, {encoding: 'utf8'});
  }));
  migrations.sort((a, b) => {
    return a.seq - b.seq;
  });
  return migrations;
};

const performMigration = async (migration, lastCompleted) => {
  const {label, seq, sql} = migration;
  if (seq > lastCompleted) {
    const result = await pgQuery(sql, label);
    await pgQuery(`
        INSERT INTO ${tableName_migrate} (sequence, label, result)
        VALUES (${seq}, '${label}', '${JSON.stringify(result)}')
      `);
    console.log(`${seq}: Complete (${label})`);
  } else {
    console.log(`${seq}: Skipped (${label})`);
  }
  return Promise.resolve()
}

const clearAllMigrations = async () => {
  try {
    await pgQuery(`
      TRUNCATE TABLE ${tableName_migrate};
    `);
  } catch (e) {
    return Promise.reject(e);
  }
}

const clearFromSequence = async (clearFrom) => {
  try {
    const rowsToClear = (await pgQuery(`
      SELECT sequence FROM ${tableName_migrate}
      WHERE sequence >= ${clearFrom}
    `)).rows;
    return Promise.all(rowsToClear.map(async (row) => {
      return pgQuery(`
        DELETE FROM ${tableName_migrate} WHERE sequence = ${row.sequence}
      `);
    }))
  } catch (e) {
    return Promise.reject(e);
  }
}

const getLastCompleted = async () => {
  try {
    const lastCompleted = await pgQuery(`
      SELECT MAX(sequence) FROM ${tableName_migrate}
    `);
    return lastCompleted.rows[0].max;
  } catch (e) {
    return Promise.reject(e);
  }
}

(async () => {
  if (process.argv.indexOf('-c') > -1) {
    await clearAllMigrations();
  } else if (process.argv.indexOf('-s') > -1) {
    const clearFrom = process.argv[process.argv.indexOf('-s') + 1];
    await clearFromSequence(clearFrom);
  }

  const migrations = await getMigrations(migrationPath);

  if (!(await setup.checkMigrationTableExists())) {
    await setup.installUUIDExtension();
    await setup.createMigrationTable();
    await setup.createPopulationTable();
  }

  const lastCompleted = await getLastCompleted();

  await Promise.all(migrations.map(async (migration) => {
    await performMigration(migration, lastCompleted);
  }));
})();
