import {getLayerNamesFromGDBFile, getMetaDataForGDBLayer, loadFromGDBFileToStaging} from "../../../lib/gdb.js";
import {registerLayerInstance} from "../../../lib/load.js";
import {logDebug, logError} from "../../../lib/logging.js";
import {storeMetaDataInDB} from "../../../lib/metadata.js";
import {nullPromise, showTimeStamp} from "../../../lib/utils.js";
import {validateGeometries} from "../../../lib/validate.js";
import {EtlStages, LayerOptions, LayerRecord, LoaderOptions} from "../../../types/etl.js";
import {getLayerOptions} from "./options.js";
import {
  alterStagingTable,
  getInstanceDescription,
  getFilePath,
  getGDBLayerName, loadToData
} from "./stages.js";

export const etlStages: EtlStages = {
  resetDirs: false,
  getFilesFromSource: true,
  unzipFiles: true,
  getFileNamesFromTmpDir: true,
  resetStagingSchema: false,
  loadToStaging: true,
  registerLayerInstance: true,
  loadMetaData: true,
  loadToData: true,
  validateGeometries: false,
}

const executeETLStages = async (
  opts: LayerOptions,
  etlStages: EtlStages,
  gdbLayerName: string,
) => {
  const filePath = await getFilePath(opts);

  // extra step to alter staging table to match full inclusive table
  if (etlStages.loadToStaging) {
    await loadFromGDBFileToStaging(filePath, opts, gdbLayerName, 'MULTIPOLYGON');
    await alterStagingTable(opts, gdbLayerName);
  }

  if (etlStages.registerLayerInstance) {
    const instanceRowId = await registerLayerInstance(
      getInstanceDescription(opts),
      opts
    );

    if (etlStages.loadMetaData) {
      const layerMetaData: string = await getMetaDataForGDBLayer(
        filePath,
        gdbLayerName,
        opts
      );
      await storeMetaDataInDB(layerMetaData, instanceRowId, opts);
    }
  }

  if (etlStages.loadToData) {
    await loadToData(opts);
  }
}

export const extractTransformLoad = async (
  loaderOpts: LoaderOptions,
  layers: LayerRecord[],
  etlStages: EtlStages
) => {
  try {
    let filePath, gdbLayerNames: string[];
    if (!loaderOpts.user.validate) {
      filePath = await getFilePath(loaderOpts);
      gdbLayerNames = await getLayerNamesFromGDBFile(filePath);
    }
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
          const gdbLayerName: string | null = getGDBLayerName(layerOpts, gdbLayerNames);
          if (!gdbLayerName) {
            return null;
          }
          await executeETLStages(layerOpts, etlStages, gdbLayerName);
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
