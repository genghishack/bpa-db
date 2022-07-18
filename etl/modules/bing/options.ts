import {capitalizeAndCompressString} from "../../../lib/utils.js";
import {logDebug} from "../../../lib/logging.js";
import {LayerOptions, LayerRecord, LoaderOptions} from "../../../types/etl.js";

export const getLayerOptions = (
  layer: LayerRecord,
  loaderOpts: LoaderOptions
) => {
  let layerType: string = '';
  let layerDir: string = '';
  let layerTable: string = '';
  let subLayer: any[] = [];
  let geomType = '';
  let stateName = capitalizeAndCompressString(loaderOpts.state.name);
  if (stateName === 'DistrictOfColumbia') {
    stateName = 'DistrictofColumbia';
  }
  switch (layer.layer_name) {
    case 'building_footprints':
      layerType = 'geojson';
      layerDir = `${stateName}.geojson.zip`;
      layerTable = `${loaderOpts.state.abbrev.toLowerCase()}_${layer.table_name}`;
      break;
  }

  return<LayerOptions> {
    ...loaderOpts,
    layer: {
      name: layer.layer_name,
      pk: layer.pk_name,
      table: layerTable,
      parentTable: layer.table_name,
      dir: layerDir,
      type: layerType,
      subLayer,
      geomType
    }
  };
}
