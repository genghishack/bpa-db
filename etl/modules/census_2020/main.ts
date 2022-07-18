import {getFileList, getMetaDataForCensusDBF, loadToData} from "../../../lib/census.js";
import {unzipFiles} from "../../../lib/extract.js";
import {registerLayerInstance} from "../../../lib/load.js";
import {logDebug, logError} from "../../../lib/logging.js";
import {storeEAMetaDataInDB, storeMetaDataInDB} from "../../../lib/metadata.js";
import {nullPromise, showTimeStamp} from "../../../lib/utils.js";
import {validateGeometries} from "../../../lib/validate.js";
import {EtlStages, LayerOptions, LayerRecord, LoaderOptions} from "../../../types/etl.js";
import {getLayerOptions} from "./options.js";
import {loadToStaging} from "./stages.js";

export const etlStages: EtlStages = {
  resetDirs: false,
  resetStagingSchema: true,
  unzipFiles: true,
  loadToStaging: true,
  loadToData: true,
  registerLayerInstance: true,
  loadMetaData: true,
  validateGeometries: false,
}

const executeETLStages = async (
  opts: LayerOptions,
  etlStages: EtlStages,
) => {
  const fileList = await getFileList(opts);

  if (fileList.length) {
    if (etlStages.unzipFiles) {
      await unzipFiles(opts, fileList);
    }

    if (etlStages.loadToStaging) {
      await loadToStaging(opts, fileList);
    }

    if (etlStages.loadToData) {
      await loadToData(opts);

      if (etlStages.registerLayerInstance) {
        const description = `${opts.year} ${opts.state.abbrev.toUpperCase()} ${opts.layer.name}`;
        const instanceRowId = await registerLayerInstance(description, opts);
        // logDebug({instanceRowId});

        if (etlStages.loadMetaData) {
          const layerMetaData = await getMetaDataForCensusDBF(fileList[0].name, opts)
          await storeMetaDataInDB(layerMetaData.xml, instanceRowId, opts);
          await storeEAMetaDataInDB(layerMetaData.eaXml, instanceRowId, opts);
        }
      }
    }
  }
}

export const extractTransformLoad = async (
  loaderOpts: LoaderOptions,
  layers: LayerRecord[],
  etlStages: EtlStages,
) => {
  try {
    await layers.reduce(
      (p: Promise<any>, layer: LayerRecord) => p.then(async () => {
        const layerOpts: LayerOptions = getLayerOptions(layer, loaderOpts);
        logDebug({layer: layerOpts.layer});
        if (loaderOpts.user.validate) {
          const result = await validateGeometries(layerOpts);
          if (result && result.type == 'msg') {
            console.log(result.value);
          }
        } else {
          await executeETLStages(layerOpts, etlStages);
        }
        showTimeStamp();
        return null;
      }),
      nullPromise()
    )
    return null;
  } catch (e) {
    logError(e);
  }
}
