import {logDebug} from "../../../lib/logging.js";
import {LayerOptions, LayerRecord, LoaderOptions} from "../../../types/etl.js";

export const getLayerOptions = (
  layer: LayerRecord,
  loaderOpts: LoaderOptions
) => {
  let layerDir: string = '';
  let layerType: string = '';
  let geomType = '';
  let source = {...loaderOpts.source};
  switch (layer.layer_name) {
    case 'firm_panels_esri':
      source = {
        ...loaderOpts.source,
        url: 'https://hazards.fema.gov',
        path: '/gis/nfhl/rest/services/public/NFHL/MapServer/3',
      }
      layerType = 'esri';
      break;

    case 'study_info_esri':
      source = {
        ...loaderOpts.source,
        url: 'https://hazards.fema.gov',
        path: '/gis/nfhl/rest/services/public/NFHL/MapServer/41',
      }
      layerType = 'esri';
      break;

    case 'flood_hazard_zones_esri':
      source = {
        ...loaderOpts.source,
        url: 'https://hazards.fema.gov',
        path: '/gis/nfhl/rest/services/public/NFHL/MapServer/28',
      }
      layerType = 'esri';
      break;

    case 'political_jurisdictions_esri':
      source = {
        ...loaderOpts.source,
        url: 'https://hazards.fema.gov',
        path: '/gis/nfhl/rest/services/public/NFHL/MapServer/22',
      }
      layerType = 'esri';
      break;

    case 's_firm_pan':
      geomType = 'MULTIPOLYGON';
      layerDir = 'NFHL_Key_Layers.gdb';
      layerType = 'file';
      break;

    case 's_fld_haz_ar':
      geomType = 'MULTIPOINT';
      layerDir = 'NFHL_Key_Layers.gdb';
      layerType = 'file';
      break;

    case 'study_info':
      geomType = 'MULTIPOINT';
      layerDir = 'NFHL_Key_Layers.gdb';
      layerType = 'file';
      break;
  }

  return<LayerOptions> {
    ...loaderOpts,
    source,
    layer: {
      name: layer.layer_name,
      pk: layer.pk_name,
      table: layer.table_name,
      parentTable: layer.table_name,
      dir: layerDir,
      type: layerType,
      geomType
    }
  };
}
