import {loadFromStagingToData, registerLayerInstance} from "../../../lib/load.js";
import {pgQuery} from "../../../lib/postgres.js";
import {createDataTables} from "../../../lib/sql.js";
import {renameStagingFields} from "../../../lib/transform.js";
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

export const registerNFHLLayerInstance = async (
  opts: LayerOptions
) => {
  let description = opts.layer.name;
  if (opts.layer.prefix) {
    description = `${opts.layer.prefix} ${opts.layer.name}`;
  }
  await registerLayerInstance(description, opts);
}

export const loadToData = async (
  opts: LayerOptions,
) => {
  await createDataTables(opts);
  await renameStagingFields(opts);
  await loadFromStagingToData(opts);
}

export const removeInvalidRowsFromStaging = async (
  opts: LayerOptions
) => {
  const label = 'remove invalid rows from staging';
  const sql = `
    DELETE FROM ${opts.schema.staging}.${opts.layer.table}
    WHERE dfirm_id IS NULL;
  `;
  return pgQuery(sql, [], label);
}
