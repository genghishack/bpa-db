import {LayerRecord} from "../../../types/etl.js";
import {hydrateLayer} from "../../lib/hydrate.js";
import {iterateLayerRecords} from "../../lib/iterate.js";
import {getLayerOptions} from "./common/options.js";

export default async (
  layers: LayerRecord[],
) => {
  await iterateLayerRecords(layers, getLayerOptions, async () => {
    const result = await hydrateLayer();
    if (result && result.type === 'msg') {
      log.info(result.value);
    }
  })
}


