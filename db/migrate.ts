import {getDateStamp} from "../lib/utils.js";
import {logger} from '../startup.js'; // configures env
import {getMigrations} from './lib/migrate.js';
import {readUserOptions, resetUserOptions} from "./options/migrate.js";
import {
  dbMigrateTableExists, clearAllMigrations,
  clearMigrationsFromSequence, clearModuleMigrations,
  createDbMigrateTable, getLastCompletedMigration,
  layerMgtSchemaExists, createLayerMgtSchema, performMigration
} from "./sql/migrate.js";
import {MigrateUserOptions} from "../types/migrate.js";

const handleUserOptions = async (opts: MigrateUserOptions) => {
  if (opts.clear) {
    if (opts.module) {
      await clearModuleMigrations(opts.module);
    } else {
      await clearAllMigrations();
    }
  } else if (opts.exact) {
    // exact takes precedence over start
    // TODO: run only the single migration specified
  } else if (opts.start) {
    await clearMigrationsFromSequence(opts.start, opts.module);
  }
}

(async () => {
  globalThis.logParent = logger(`${getDateStamp()}_migrate`);
  globalThis.log = logParent.child({module: 'unknown'});
  globalThis.migrateUserOpts = readUserOptions();

  if (!(await layerMgtSchemaExists())) {
    await createLayerMgtSchema();
  }
  if (!(await dbMigrateTableExists())) {
    globalThis.migrateUserOpts = resetUserOptions();
    await createDbMigrateTable();
  }
  globalThis.log = logParent.child({module: migrateUserOpts.module});

  await handleUserOptions(migrateUserOpts);

  const migrations = await getMigrations(migrateUserOpts.module);

  const seqNumbers = migrations.map((migration) => {
    return migration.seq;
  }).sort((a, b) => a - b);
  log.debug({seqNumbers});

  const lastCompleted: number = await getLastCompletedMigration(seqNumbers, migrateUserOpts.module);
  log.debug({lastCompleted});

  // log.debug({migrations})
  await migrations.reduce(
    (p: Promise<any>, migration) => p.then(async () => {
      await performMigration(migration, lastCompleted, migrateUserOpts.module);
    }),
    Promise.resolve(null)
  );
})();
