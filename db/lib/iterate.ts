import {nullPromise} from "../../lib/utils.js";
import {LayerRecord} from "../../types/etl.js";
import {getTableConfigForSchemaAndState, resetSchema} from "../sql/general.js";

export const runConsecutively = async (array: any[], callback: Function) => {
  await array.reduce(
    (p: Promise<any>, item: any) => p.then(async () => {
      await callback(item);
      return null;
    }),
    nullPromise()
  );
}

export const iterateWithSubLayers = async (
  layers: LayerRecord[],
  getLayerOptions: Function,
  getSubLayerOptions: Function,
  callback: Function,
) => {
  await iterateLayerRecords(layers, getLayerOptions, async () => {
    const parentLayerOpts = {...layerOpts};
    if (parentLayerOpts.layer.subLayer && parentLayerOpts.layer.subLayer.length) {
      await runConsecutively(parentLayerOpts.layer.subLayer, async (subLayer: any) => {
        globalThis.layerOpts = getSubLayerOptions(parentLayerOpts, subLayer);
        log.debug({subLayer: layerOpts.layer.name});
        await callback();
      })
    } else {
      await callback();
    }
  })
}

export const iterateFilenames = async (
  layers: LayerRecord[],
  getFileNames: Function,
  getLayerOptions: Function,
  callback: Function,
) => {
  try {
    const fileNames = await getFileNames();
    log.debug({fileNames});
    await runConsecutively(fileNames, async (fileName: string) => {
      const layerName = fileName.replace('.tif', '') + '_population';
      globalThis.layerOpts = getLayerOptions(layers, layerName);
      log.info({
        layer: layerOpts.layer.name
      });
      await callback(fileName);
    })
    return null;
  } catch (e) {
    log.error(e);
  }
}

export const iterateStateLayers = async (
  layers: LayerRecord[],
  getLayerNames: Function,
  getLayerOptions: Function,
  callback: Function,
) => {
  try {
    const gdbLayerNames = await getLayerNames();
    await runConsecutively(gdbLayerNames, async (layerName: string) => {
      globalThis.layerOpts = getLayerOptions(layers, layerName);
      log.debug({layer: layerOpts.layer.name});
      await callback();
    })
    return null;
  } catch (e) {
    log.error(e);
  }
}

export const iterateGDBLayers = async (
  layers: LayerRecord[],
  getLayerNames: Function,
  getLayerOptions: Function,
  callback: Function,
) => {
  try {
    const gdbLayerNames = await getLayerNames();
    await runConsecutively(gdbLayerNames, async (layerName: string) => {
      globalThis.layerOpts = getLayerOptions(layers, layerName);
      log.debug({layer: layerOpts.layer.name});
      await callback();
    })
    return null;
  } catch (e) {
    log.error(e);
  }
}

export const iterateLayerRecords = async (
  layers: LayerRecord[],
  getLayerOptions: Function,
  callback: Function,
) => {
  try {
    await runConsecutively(layers, async (layer: any) => {
      globalThis.layerOpts = getLayerOptions(layer);
      log.debug({layer: layerOpts.layer.name});
      await callback();
    })
    return null;
  } catch (e) {
    log.error(e);
  }
}

export const processState = async (
  callback: Function,
) => {
  try {
    const layers: LayerRecord[] = await getTableConfigForSchemaAndState();
    log.debug({layers});
    await callback(layers);
  } catch (e) {
    return e;
  }
}
