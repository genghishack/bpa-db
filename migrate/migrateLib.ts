import {readdirSync} from 'fs';
import {dirname} from 'path';
import {fileURLToPath} from 'url';
import {logDebug} from '../lib/logging.js';
import {pgQuery} from "../lib/postgres.js";
import {registerMigration} from "./migrateSQL.js";

import {Migration} from "../types/migrate.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
// console.log(__dirname);

export const getMigrations = async (module: string | null) => {
  // TODO: validate module exists
  const migrationDir = (module) ? module : 'core';
  const migrationPath = `${__dirname}/migrations/${migrationDir}`;
  try {
    // TODO: This could be improved by reading the migrations table first
    //  and only loading the migrations that have not been done yet
    const fileNames = await readdirSync(migrationPath);
    const migrations: Migration[] = await Promise.all(fileNames.map(async (fileName) => {
      // logDebug({fileName});
      let {default: migration} = await import(`${migrationPath}/${fileName.replace('.ts', '.js')}`);
      return migration;
    }));
    migrations.sort((a: Migration, b: Migration) => {
      return a.seq - b.seq;
    });
    // logDebug({migrations});
    return migrations;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const performMigration = async (
  migration: Migration,
  lastCompleted: number,
  module: string | null
) => {
  const moduleName = (module) ? module : 'core';
  const {label, seq, sql} = migration;
  // console.log({seq})
  if (seq > lastCompleted) {
    try {
      // perform migration
      const result = await pgQuery(sql, [], label);
      // record migration in migration table
      await registerMigration(seq, label, moduleName, result);
      console.log(`${seq}: Complete (${label})`);
    } catch (e) {
      return Promise.reject(e);
    }
  } else {
    console.log(`${seq}: Skipped (${label})`);
  }
  return Promise.resolve()
}
