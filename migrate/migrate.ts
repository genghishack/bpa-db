import dotenv from 'dotenv';
import {logDebug} from "../lib/logging.js";
import {getMigrations, performMigration} from './migrateLib.js';
import {readUserOptions, resetUserOptions} from "./options.js";
import {
  dbMigrateTableExists, clearAllMigrations,
  clearMigrationsFromSequence, clearModuleMigrations,
  createDbMigrateTable, getLastCompletedMigration,
  layerMgtSchemaExists, createLayerMgtSchema
} from "./migrateSQL.js";
import {UserOptions} from "../types/migrate.js";

dotenv.config();

const handleUserOptions = async (opts: UserOptions) => {
  if (opts.clear) {
    if (opts.module) {
      await clearModuleMigrations(opts.module);
    } else {
      await clearAllMigrations();
    }
  } else if (opts.start) {
    await clearMigrationsFromSequence(opts.start, opts.module);
  }
}

(async () => {
  let userOpts: UserOptions = readUserOptions();

  if (!(await layerMgtSchemaExists())) {
    await createLayerMgtSchema();
  }
  if (!(await dbMigrateTableExists())) {
    userOpts = resetUserOptions();
    await createDbMigrateTable();
  }

  await handleUserOptions(userOpts);

  const migrations = await getMigrations(userOpts.module);

  const seqNumbers = migrations.map((migration) => {
    return migration.seq;
  }).sort((a, b) => a - b);
  logDebug({seqNumbers});

  const lastCompleted: number = await getLastCompletedMigration(seqNumbers, userOpts.module);
  logDebug({lastCompleted});

  // logDebug({migrations})
  await migrations.reduce(
    (p: Promise<any>, migration) => p.then(async () => {
      await performMigration(migration, lastCompleted, userOpts.module);
    }),
    Promise.resolve(null)
  );
})();
