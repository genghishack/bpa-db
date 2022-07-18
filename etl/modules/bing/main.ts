import {loadFromGeoJsonFileToStaging} from "../../../lib/geojson.js";
import {registerLayerInstance} from "../../../lib/load.js";
import {nullPromise, showTimeStamp} from "../../../lib/utils.js";
import {fileExistsInTmpDir} from "../../../lib/filesystem.js";
import {unzipFile} from "../../../lib/extract.js";
import {logDebug, logError} from "../../../lib/logging.js";
import {validateGeometries} from "../../../lib/validate.js";
import {getLayerOptions} from "./options.js";
import {
  getInstanceDescription,
  getFileFromSource,
  loadToData,
} from "./stages.js";
import {EtlStages, LayerOptions, LayerRecord, LoaderOptions} from "../../../types/etl.js";

export const etlStages: EtlStages = {
  resetDirs: false,
  getFilesFromSource: true,
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
  if (opts.layer.type === 'geojson') {
    if (etlStages.getFilesFromSource) {
      const fileExists = await fileExistsInTmpDir(opts);
      logDebug({fileExists});
      if (!fileExists) {
        await getFileFromSource(opts);
      }
    }

    if (etlStages.unzipFiles) {
      await unzipFile(`${opts.layer.dir}`, opts);
    }

    if (etlStages.loadToStaging) {
      await loadFromGeoJsonFileToStaging(opts);
    }
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
    await layers.reduce(
      (p: Promise<any>, layer: LayerRecord) => p.then(async () => {
        const layerOpts: LayerOptions = getLayerOptions(layer, loaderOpts);
        logDebug({layer: layerOpts.layer});
        if (loaderOpts.user.validate) {
          await validateGeometries(layerOpts);
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
