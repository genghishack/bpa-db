import {loadEsriApiLayerToStaging} from "../../../lib/esri.js";
import {getTmpDir} from "../../../lib/filesystem.js";
import {loadFromGDBFileToStaging} from "../../../lib/gdb.js";
import {registerLayerInstance} from "../../../lib/load.js";
import {logDebug, logError} from "../../../lib/logging.js";
import {nullPromise, showTimeStamp} from "../../../lib/utils.js";
import {validateGeometries} from "../../../lib/validate.js";
import {getLayerOptions} from "./options.js";
import {getInstanceDescription, loadToData, removeInvalidRowsFromStaging} from "./stages.js";
import {EtlStages, LayerOptions, LayerRecord, LoaderOptions} from "../../../types/etl.js";

export const etlStages: EtlStages = {
  resetDirs: false,
  getFilesFromSource: false,
  unzipFiles: false,
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
  etlStages: EtlStages
) => {
  const layerName: string = opts.layer.name;
  console.log({layerName});

  if (opts.layer.type === 'esri') {
    if (etlStages.loadToStaging) {
      await loadEsriApiLayerToStaging(opts);
    }
  }

  if (opts.layer.type === 'file') {
    if (etlStages.loadToStaging) {
      const tmpDir = await getTmpDir(opts.module);
      const filePath: string = `${tmpDir}/${opts.layer.dir}`;
      await loadFromGDBFileToStaging(filePath, opts, layerName);
      if (opts.layer.table === 's_firm_pan') {
        await removeInvalidRowsFromStaging(opts);
      }
    }
  }

  if (etlStages.loadToData) {
    await loadToData(opts);
  }

  if (etlStages.registerLayerInstance) {
    await registerLayerInstance(
      getInstanceDescription(opts),
      opts
    );
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
