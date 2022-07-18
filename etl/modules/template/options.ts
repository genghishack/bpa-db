import {logDebug} from "../../../lib/logging.js";
import {LayerOptions, LayerRecord, LoaderOptions} from "../../../types/etl.js";

const getLayerNameMatch = (layerName: string) => {
  const rLayerName = layerName.split('_');
  const ln = rLayerName.length;
  let layerNameMatch = `${rLayerName[ln-2]}_${rLayerName[ln-1]}`;
  if (rLayerName[ln-2] === 'Non') {
    layerNameMatch = `${rLayerName[ln-3]}_${rLayerName[ln-2]}_${rLayerName[ln-1]}`;
  }
  return layerNameMatch; // e.g. Parcel_Res, Point_Non_Res
}

export const getLayerOptions = (
  layers: LayerRecord[],
  layerName: string,
  loaderOpts: LoaderOptions
) => {
  const layerNameMatch = getLayerNameMatch(layerName)
  const [layer] = layers.filter(l => {
    return l.layer_name.includes(layerNameMatch.toLowerCase());
  })

  return<LayerOptions> {
    ...loaderOpts,
    layer: {
      name: layer.layer_name,
      pk: layer.pk_name,
      table: layerName.toLowerCase(),
      parentTable: layer.table_name,
    }
  };
}
