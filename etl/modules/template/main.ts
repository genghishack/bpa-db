import {registerLayerInstance} from "../../../lib/load.js";
import {logDebug, logError} from "../../../lib/logging.js";
import {nullPromise, showTimeStamp} from "../../../lib/utils.js";
import {validateGeometries} from "../../../lib/validate.js";
import {EtlStages, LayerOptions, LayerRecord, LoaderOptions} from "../../../types/etl.js";
import {getLayerOptions} from "./options.js";
import {
  getInstanceDescription,
  getFilePath,
  getLayerNames,
  loadToData,
  loadToStaging,
} from "./stages.js";

export const etlStages: EtlStages = {
  resetDirs: false,
  getFilesFromSource: false,
  unzipFiles: true,
  getFileNamesFromTmpDir: false,
  resetStagingSchema: false,
  loadToStaging: true,
  registerLayerInstance: true,
  loadMetaData: true,
  loadToData: true,
  validateGeometries: false,
}

const executeETLStages = async (
  opts: LayerOptions,
  etlStages: EtlStages
) => {
  const filePath = await getFilePath(opts);

  if (etlStages.loadToStaging) {
    await loadToStaging(filePath, opts);
  }

  if (etlStages.registerLayerInstance) {
    await registerLayerInstance(
      getInstanceDescription(opts),
      opts
    );
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
    const gdbLayerNames = await getLayerNames(loaderOpts);
    await gdbLayerNames.reduce(
      (p: Promise<any>, layerName: string) => p.then(async () => {
        const layerOpts: LayerOptions = getLayerOptions(layers, layerName, loaderOpts);
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
