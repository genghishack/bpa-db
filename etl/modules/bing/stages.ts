import {loadFromStagingToData} from "../../../lib/load.js";
import {createDataTables} from "../../../lib/sql.js";
import {renameStagingFields} from "../../../lib/transform.js";
import {getFile} from "../../../lib/wget.js";
import {LayerOptions} from "../../../types/etl.js";

export const getInstanceDescription = (
  opts: LayerOptions
) => {
  let description = opts.layer.name;
  if (opts.layer.prefix) {
    description = `${opts.layer.prefix} ${opts.layer.name}`;
  }
  return description;
}

export const loadToData = async (
  opts: LayerOptions,
) => {
  await createDataTables(opts);
  await renameStagingFields(opts);
  await loadFromStagingToData(opts);
}

export const getFileFromSource = async (opts: LayerOptions) => {
  console.log('Retrieving file from source...');
  const baseUrl = `${opts.source.url}${opts.source.path}`;
  const fileName = opts.layer.dir;
  await getFile(fileName!, baseUrl, null, opts);
  return fileName;
}
