import {readdirSync} from 'fs';
import {dirname} from 'path';
import {fileURLToPath} from 'url';

import {Migration} from "../../types/migrate.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
// log.info(__dirname);

export const getMigrations = async (module: string | null) => {
  // TODO: validate module exists
  const moduleDir = (module) ? module : 'core';
  const migrationPath = `${__dirname}/../modules/${moduleDir}/migrations`;
  try {
    // TODO: This could be improved by reading the migrations table first
    //  and only loading the migrations that have not been done yet
    const fileNames = await readdirSync(migrationPath);
    const migrations: Migration[] = await Promise.all(fileNames.map(async (fileName) => {
      // log.debug({fileName});
      let {default: migration} = await import(`${migrationPath}/${fileName.replace('.ts', '.js')}`);
      return migration;
    }));
    migrations.sort((a: Migration, b: Migration) => {
      return a.seq - b.seq;
    });
    // log.debug({migrations});
    return migrations;
  } catch (e) {
    return Promise.reject(e);
  }
};
