import {LayerRecord} from "../../../types/etl.js";
import {getFileList} from "../../lib/census.js";
import {iterateLayerRecords} from "../../lib/iterate.js";
import {getLayerOptions} from "./common/options.js";

const download = async (
  layers: LayerRecord[],
) => {
  await iterateLayerRecords(layers, getLayerOptions, async () => {
    const fileList = await getFileList();
    log.debug({fileList});
  })
}

export default download;
