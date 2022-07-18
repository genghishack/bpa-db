import {loadDataFromDBFFilesToStaging} from "../../../lib/census.js";
import {logDebug} from "../../../lib/logging.js";
import {renameStagingTableField} from "../../../lib/transform.js";
import {EtlStages, FileObjList, LayerOptions} from "../../../types/etl.js";

export const renameStagingFields = async (opts: LayerOptions) => {
  logDebug(`Renaming Primary key for ${opts.layer.name} staging table...`);
  try {
    switch (opts.layer.name) {
      case 'PLACE':
        await renameStagingTableField('geoid', 'plcidfp', opts);
        break;
      case 'COUSUB':
        await renameStagingTableField('geoid', 'cosbidfp', opts);
        break;
      case 'TRACT':
        await renameStagingTableField('geoid', 'tract_id', opts);
        break;
      case 'BG':
        await renameStagingTableField('geoid', 'bg_id', opts);
        break;
      case 'TABBLOCK20':
        await renameStagingTableField('geoid20', 'tabblock_id', opts);
        await renameStagingTableField('statefp20', 'statefp', opts);
        break;
      default:
        return Promise.resolve(null);
    }
  } catch (e) {
    return Promise.reject(e)
  }
}

export const loadToStaging = async (
  opts: LayerOptions,
  fileList: FileObjList,
) => {
  await loadDataFromDBFFilesToStaging(opts, fileList);
  await renameStagingFields(opts);
}
