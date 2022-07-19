import {LayerRecord} from "../../../types/etl.js";
import {loadMetadata} from "../../lib/census.js";
import {iterateLayerRecords} from "../../lib/iterate.js";
import {getLayerOptions} from "./common/options.js";

const metadata = async (
  layers: LayerRecord[],
) => {
  await iterateLayerRecords(layers, getLayerOptions, async () => {
    await loadMetadata();
  })
}

export default metadata;
