import dateFormat from 'dateformat';
import {logDebug} from "../../../lib/logging.js";

import {LayerOptions, LayerRecord, LoaderOptions, SubLayer} from "../../../types/etl.js";

export const getLayerOptions = (
  layer: LayerRecord,
  loaderOpts: LoaderOptions
) => {
  let subLayer: any[] = [];
  let layerDir: string = '';
  let layerType: string = '';
  let geomType = '';
  let source = {...loaderOpts.source};
  switch (layer.layer_name) {
    case 'nhc_tws_forecast_cone':
      layerType = 'esri';
      source = {
        ...loaderOpts.source,
        url: 'https://idpgis.ncep.noaa.gov',
        path: '/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/NHC_tropical_weather_summary/MapServer/8'
      };
      break;

    case 'nhc_tws_forecast_points':
      layerType = 'esri';
      source = {
        ...loaderOpts.source,
        url: 'https://idpgis.ncep.noaa.gov',
        path: '/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/NHC_tropical_weather_summary/MapServer/6'
      };
      break;

    case 'nhc_tws_past_points':
      layerType = 'esri';
      source = {
        ...loaderOpts.source,
        url: 'https://idpgis.ncep.noaa.gov',
        path: '/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/NHC_tropical_weather_summary/MapServer/11'
      };
      break;

    case 'nws_flood_outlook':
      layerType = 'esri';
      source = {
        ...loaderOpts.source,
        url: 'https://idpgis.ncep.noaa.gov',
        path: '/arcgis/rest/services//NWS_Forecasts_Guidance_Warnings/sig_riv_fld_outlk/MapServer/0'
      };
      break;

    case 'nws_excessive_rainfall':
      layerType = 'esri';
      source = {
        ...loaderOpts.source,
        url: 'https://idpgis.ncep.noaa.gov',
        path: '/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/wpc_precip_hazards/MapServer'
      };
      subLayer = [
        {
          prefix: 'day1',
          dir: '0',
        },
        {
          prefix: 'day2',
          dir: '1',
        },
        {
          prefix: 'day3',
          dir: '2',
        }
      ]
      break;

    case 'nws_wpc_qpf':
      layerType = 'esri';
      source = {
        ...loaderOpts.source,
        url: 'https://idpgis.ncep.noaa.gov',
        path: '/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/wpc_qpf/MapServer'
      };
      subLayer = [
        {
          prefix: 'day1',
          dir: '1',
        },
        {
          prefix: 'day2',
          dir: '2',
        },
        {
          prefix: 'day3',
          dir: '3',
        },
        {
          prefix: 'day1_5',
          dir: '10',
        },
        {
          prefix: 'day1_7',
          dir: '11',
        },
      ]
      break;

    case 'nws_river_stages':
      layerType = 'esri';
      source = {
        ...loaderOpts.source,
        url: 'https://idpgis.ncep.noaa.gov',
        path: '/arcgis/rest/services/NWS_Observations/ahps_riv_gauges/MapServer'
      };
      subLayer = [
        {
          prefix: 'observed',
          dir: '0',
        },
        {
          prefix: 'forecast',
          dir: '15',
        },
      ]
      break;

    case 'hurdat2':
      layerType = 'hurdat';
      geomType = 'POINT';
      source = {
        ...loaderOpts.source,
        url: 'https://www.nhc.noaa.gov',
        path: '/data/hurdat',
      };
      subLayer = [
        {
          prefix: 'atl',
          dir: 'hurdat2-1851-2020-052921.txt',
        },
        {
          prefix: 'pac',
          dir: 'hurdat2-nepac-1949-2020-043021a.txt',
        }
      ]
      break;

    case 'nws_ahps_qpe':
      const now = new Date();
      const dateStr = dateFormat(now, 'yyyymmdd');
      layerType = 'qpe';
      source = {
        ...loaderOpts.source,
        url: 'https://water.weather.gov',
        path: [
          `/precip/downloader.php?date=${dateStr}&file_type=geotiff&format=tar&range=1day`,
          `/precip/downloader.php?date=${dateStr}&file_type=geotiff&format=tar&range=last7days`,
        ]
      };
      subLayer = [
        {
          prefix: 'ak_1day',
          dir: `nws_precip_1day_${dateStr}_ak.tif`,
          index: 0
        },
        {
          prefix: 'conus_1day',
          dir: `nws_precip_1day_${dateStr}_conus.tif`,
          index: 0
        },
        {
          prefix: 'pr_1day',
          dir: `nws_precip_1day_${dateStr}_pr.tif`,
          index: 0
        },
        {
          prefix: 'ak_7day',
          dir: `nws_precip_last7days_${dateStr}_ak.tif`,
          index: 1
        },
        {
          prefix: 'conus_7day',
          dir: `nws_precip_last7days_${dateStr}_conus.tif`,
          index: 1
        },
        {
          prefix: 'pr_7day',
          dir: `nws_precip_last7days_${dateStr}_pr.tif`,
          index: 1
        },
      ]
      break;

    case 'storm_ahps_current':
      layerType = 'wfs';
      geomType = 'MULTIPOINT';
      layerDir = 'NWS_Observations/ahps_riv_gauges/MapServer/WFSServer?service=WFS&version=2.0.0&request=GetFeature&typeName=ahps_riv_gauges:Full_Forecast_Period_Stages&srsName=EPSG:4326&propertyname=state,waterbody,status,gaugelid,idp_filedate,url';
      break;

    case 'storm_srfo_current':
      layerType = 'wfs';
      geomType = 'MULTIPOLYGON';
      layerDir = 'NWS_Forecasts_Guidance_Warnings/sig_riv_fld_outlk/MapServer/WFSServer?service=WFS&version=2.0.0&request=GetFeature&typeName=sig_riv_fld_outlk:Flood_Outlook&srsName=EPSG:4326';
      break;

    case 'storm_outlook_current':
      layerType = 'wfs';
      geomType = 'MULTIPOINT';
      layerDir = 'NWS_Forecasts_Guidance_Warnings/NHC_tropical_weather_summary/MapServer/WFSServer?&service=WFS&request=getfeature&typename=NHC_tropical_weather_summary:Forecast_Points&srsName=EPSG:4326';
      break;

    case 'storm_ero_current':
      layerType = 'wfs';
      geomType = 'MULTIPOLYGON';
      subLayer = [
        {
          prefix: 'day1',
          dir: 'NWS_Forecasts_Guidance_Warnings/wpc_precip_hazards/MapServer/WFSServer?service=WFS&version=2.0.0&request=GetFeature&typeName=wpc_precip_hazards:Excessive_Rainfall_Day_1',
        },
        {
          prefix: 'day2',
          dir: 'NWS_Forecasts_Guidance_Warnings/wpc_precip_hazards/MapServer/WFSServer?service=WFS&version=2.0.0&request=GetFeature&typeName=wpc_precip_hazards:Excessive_Rainfall_Day_2',
        },
        {
          prefix: 'day3',
          dir: 'NWS_Forecasts_Guidance_Warnings/wpc_precip_hazards/MapServer/WFSServer?service=WFS&version=2.0.0&request=GetFeature&typeName=wpc_precip_hazards:Excessive_Rainfall_Day_3',
        }
      ]
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
      subLayer,
      geomType
    }
  };
}

export const getSubLayerOptions = (
  opts: LayerOptions,
  subLayer: SubLayer
) => {
  return<LayerOptions> {
    ...opts,
    layer: {
      ...opts.layer,
      table: `${subLayer.prefix}_${opts.layer.table}`,
      dir: `${opts.layer.dir}${subLayer.dir}`,
      prefix: subLayer.prefix,
      index: subLayer.index,
    }
  };
}

