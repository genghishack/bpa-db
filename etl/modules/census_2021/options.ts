import {LayerOptions, LayerRecord, LoaderOptions} from "../../../types/etl.js";

export const getLayerOptions = (
  layer: LayerRecord,
  opts: LoaderOptions
) => {
  let {table_name: tableName} = layer;
  if (opts.state.abbrev !== 'us') {
    tableName = `${opts.state.abbrev.toLowerCase()}_${layer.table_name}`;
  }
  const year = parseInt(opts.module.split('census_')[1], 10);

  return<LayerOptions> {
    ...opts,
    year,
    layer: {
      name: layer.layer_name,
      pk: layer.pk_name,
      table: tableName,
      parentTable: layer.table_name,
      dir: `${opts.source.path}/${layer.layer_name}`,
    }
  }
}

