import {getTmpDir} from "../../../lib/filesystem.js";
import {getLayerNamesFromGDBFile, loadFromGDBFileToStaging} from "../../../lib/gdb.js";
import {loadFromStagingToData} from "../../../lib/load.js";
import {createDataTables} from "../../../lib/sql.js";
import {renameStagingFields} from "../../../lib/transform.js";
import {capitalizeAndUnderscoreString} from "../../../lib/utils.js";
import {LayerOptions, LoaderOptions} from "../../../types/etl.js";

export const getInstanceDescription = (
  opts: LayerOptions
) => {
  return `${opts.state.abbrev} ${opts.layer.county} ${opts.layer.name}`;
}

export const loadToStaging = async (
  filePath: string,
  opts: LayerOptions,
) => {
  return loadFromGDBFileToStaging(filePath, opts, opts.layer.table);
}

export const loadToData = async (
  opts: LayerOptions,
) => {
  await createDataTables(opts);
  await renameStagingFields(opts);
  await loadFromStagingToData(opts);
}

export const getFilePath = async (opts: LoaderOptions) => {
  const tmpDir = await getTmpDir(opts.module);
  const stateName = capitalizeAndUnderscoreString(opts.state.name);
  return `${tmpDir}/${stateName}.gdb`;
}

export const getLayerNames = async (opts: LoaderOptions) => {
  const filePath = await getFilePath(opts);
  const gdbLayerNames: string[] = await getLayerNamesFromGDBFile(filePath);
  // logDebug({gdbLayerNames});
  return gdbLayerNames;
}
