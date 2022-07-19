import {MigrateUserOptions} from "../../types/migrate.js";

export const resetUserOptions = () => {
  return<MigrateUserOptions> {
    module: null,
    clear: false,
    start: null,
    exact: null
  }
}

export const readUserOptions = () => {
  const {argv: opts} = process;
  let module: string|null = null;
  let start: number|null = null;
  let exact: number|null = null;
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

  const exactIndex = opts.indexOf('-e');
  if (exactIndex > -1) {
    exact = parseFloat(opts[exactIndex + 1]);
    // TODO check for value presence and validity
  }

  if (opts.indexOf('-c') > -1) {
    clear = true;
  }

  return<MigrateUserOptions> {
    module,
    start,
    exact,
    clear,
  }
}

