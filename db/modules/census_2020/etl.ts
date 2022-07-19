import {LayerRecord} from "../../../types/etl";
import {FileObjList} from "../../../types/general.js";
import {getFileList, loadDataFromDBFFilesToStaging, loadToData} from "../../lib/census.js";
import {unzipFiles} from "../../lib/extract.js";
import {iterateLayerRecords} from "../../lib/iterate.js";
import {resetSchema} from "../../sql/general.js";
import {registerLayerInstance} from "../../sql/load.js";
import {renameStagingTableField} from "../../sql/transform.js";
import {getLayerOptions} from "./common/options.js";

export const renameStagingFields = async () => {
  const {layer} = layerOpts;
  log.debug(`Renaming Primary key for ${layer.name} staging table...`);
  try {
    switch (layer.name) {
      case 'PLACE':
        await renameStagingTableField('geoid', 'plcidfp');
        break;
      case 'COUSUB':
        await renameStagingTableField('geoid', 'cosbidfp');
        break;
      case 'TRACT':
        await renameStagingTableField('geoid', 'tract_id');
        break;
      case 'BG':
        await renameStagingTableField('geoid', 'bg_id');
        break;
      case 'TABBLOCK':
        await renameStagingTableField('geoid10', 'tabblock_id');
        await renameStagingTableField('statefp10', 'statefp');
        break;
      case 'TABBLOCK20':
        await renameStagingTableField('geoid20', 'tabblock_id');
        await renameStagingTableField('statefp20', 'statefp');
        break;
      default:
        return Promise.resolve(null);
    }
  } catch (e) {
    return Promise.reject(e)
  }
}

export const loadToStaging = async (
  fileList: FileObjList,
) => {
  await loadDataFromDBFFilesToStaging(fileList);
  await renameStagingFields();
}

const etl = async (
  layers: LayerRecord[],
) => {
  // TODO: Make it standard that staging schemas are erased after etl is completed
  if (etlStages.resetStagingSchema) {
    // Destroy and re-create the staging schema
    await resetSchema(loaderOpts.schema.staging);
  }

  await iterateLayerRecords(layers, getLayerOptions, async () => {
    const {year, state, layer} = layerOpts;
    const fileList = await getFileList();

    if (fileList.length) {
      await unzipFiles(fileList);

      if (etlStages.loadToStaging) {
        await loadToStaging(fileList);
      }

      if (etlStages.loadToData) {
        await loadToData();

        if (etlStages.registerLayerInstance) {
          const description = `${year} ${state.abbrev.toUpperCase()} ${layer.name}`;
          await registerLayerInstance(description);
        }
      }
    }
  })
}

export default etl;
