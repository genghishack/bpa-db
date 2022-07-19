import {LayerOptions, LayerRecord} from "../../../../types/etl.js";

export const getLayerOptions = (
  layer: LayerRecord,
) => {
  let {table_name: tableName} = layer;
  if (loaderOpts.state.abbrev !== 'us') {
    tableName = `${loaderOpts.state.abbrev.toLowerCase()}_${layer.table_name}`;
  }
  const year = parseInt(loaderOpts.module.split('census_')[1], 10);

  return<LayerOptions> {
    ...loaderOpts,
    year,
    layer: {
      name: layer.layer_name,
      pk: layer.pk_name,
      table: tableName,
      stagingTable: tableName,
      parentTable: layer.table_name,
      dir: `${loaderOpts.source.path}/${layer.layer_name}`,
    }
  }
}

