import {LayerOptions, LayerRecord, LoaderOptions} from "../../../types/etl.js";

export const getLayerOptions = (
  layer: LayerRecord,
  opts: LoaderOptions
) => {
  const tableName = `${opts.state.abbrev.toLowerCase()}_${layer.table_name}`;

  return<LayerOptions> {
    ...opts,
    layer: {
      name: layer.layer_name,
      pk: layer.pk_name,
      table: tableName,
      parentTable: layer.table_name,
      dir: `${opts.source.path}/${layer.layer_name}`,
    }
  }
}

