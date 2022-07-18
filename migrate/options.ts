import {nullPromise} from "../lib/utils.js";
import {UserOptions} from "../types/migrate.js";
import {dbMigrateTableExists, clearAllMigrations, clearMigrationsFromSequence} from "./migrateSQL.js";

export const resetUserOptions = () => {
  return<UserOptions> {
    module: null,
    clear: false,
    start: null,
    end: null
  }
}

export const readUserOptions = () => {
  const {argv: opts} = process;
  let module: string|null = null;
  let start: number|null = null;
  let end: number|null = null;
  let clear: boolean = false;

  const moduleIndex = opts.indexOf('-m');
  if (moduleIndex > -1) {
    module = opts[moduleIndex + 1];
    // TODO check for value presence and validity
  }

  const startIndex = opts.indexOf('-s');
  if (startIndex > -1) {
    start = parseFloat(opts[startIndex + 1]);
    // TODO check for value presence and validity
  }

  const endIndex = opts.indexOf('-e');
  if (endIndex > -1) {
    end = parseFloat(opts[endIndex + 1]);
    // TODO check for value presence and validity
  }

  if (opts.indexOf('-c') > -1) {
    clear = true;
  }

  return<UserOptions> {
    module,
    start,
    end,
    clear,
  }
}

