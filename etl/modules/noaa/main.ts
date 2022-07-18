import {loadEsriApiLayerToStaging} from "../../../lib/esri.js";
import {fileExistsInTmpDir} from "../../../lib/filesystem.js";
import {loadGeoTiffToStaging} from "../../../lib/geotiff.js";
import {registerLayerInstance} from "../../../lib/load.js";
import {logDebug, logError} from "../../../lib/logging.js";
import {nullPromise, showTimeStamp} from "../../../lib/utils.js";
import {validateGeometries} from "../../../lib/validate.js";
import {loadWFSLayerToStaging} from "../../../lib/wfs.js";
import {getLayerOptions, getSubLayerOptions} from "./options.js";
import {
  getInstanceDescription,
  getFileFromSource,
  getQPETarballFromSource,
  loadToData,
  unTarQPETarball,
  loadHurdatToData,
} from "./stages.js";
import {EtlStages, LayerOptions, LayerRecord, LoaderOptions, SubLayer} from "../../../types/etl.js";

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
  if (opts.layer.type === 'esri') {
    if (etlStages.loadToStaging) {
      await loadEsriApiLayerToStaging(opts);
    }
  }

  if (opts.layer.type === 'qpe') {
    if (etlStages.getFilesFromSource) {
      if (!(await fileExistsInTmpDir(opts))) {
        await getQPETarballFromSource(opts);
        if (etlStages.unzipFiles) {
          await unTarQPETarball(opts);
        }
      }
    }

    if (etlStages.loadToStaging) {
      if ((await fileExistsInTmpDir(opts))) {
        await loadGeoTiffToStaging(opts);
      }
    }
  }

  if (opts.layer.type === 'hurdat') {
    if (etlStages.getFilesFromSource) {
      if (!(await fileExistsInTmpDir(opts))) {
        await getFileFromSource(opts);
      }
    }
  }

  if (opts.layer.type === 'wfs') {
    if (etlStages.loadToStaging) {
      await loadWFSLayerToStaging(opts);
    }
  }

  if (etlStages.registerLayerInstance) {
    await registerLayerInstance(
      getInstanceDescription(opts),
      opts
    );
  }

  if (etlStages.loadToData) {
    if (opts.layer.type === 'hurdat') {
      await loadHurdatToData(opts);
    } else {
      await loadToData(opts);
    }
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
        if (layerOpts.layer.subLayer && layerOpts.layer.subLayer.length) {
          await layerOpts.layer.subLayer.reduce(
            (p1: Promise<any>, subLayer) => p1.then(async () => {
              const subLayerOpts: LayerOptions = getSubLayerOptions(layerOpts, subLayer);
              logDebug({subLayer: subLayerOpts.layer});
              if (loaderOpts.user.validate) {
                const result = await validateGeometries(subLayerOpts);
                if (result && result.type == 'msg') {
                  console.log(result.value);
                }
              } else {
                await executeETLStages(subLayerOpts, etlStages);
              }
              showTimeStamp();
            }),
            nullPromise()
          )
        } else {
          if (loaderOpts.user.validate) {
            await validateGeometries(layerOpts);
          } else {
            await executeETLStages(layerOpts, etlStages);
          }
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
