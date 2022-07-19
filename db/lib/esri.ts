import axios from "axios";
import {pgCleanFieldName} from "../../lib/postgres.js";
import {getQueryStr} from "../../lib/utils.js";
import {EsriFeature, EsriField, EsriLayerInfo} from "../../types/esri.js";
import {PgColumnObjType} from "../../types/etl.js";
import {createStagingTableFromJson, populateStagingTableFromJson} from "../sql/esri.js";

export const esriApiQuery = async (params: any) => {
  const {source, layer} = layerOpts;
  const layerUrl = `${source.url}${source.path}/${layer.dir}`;
  const queryUrl = `${layerUrl}/query?${getQueryStr(params)}`;
  log.debug({queryUrl});
  const {data}:any = await axios({
    method: 'get',
    url: queryUrl,
  });
  // log.debug({data})
  return data;
}

export const getFeaturesFromEsri = async (
  maxRecordCount: number,
  offset: number = 0,
) => {
  const params = {
    f: 'pjson',
    where: '1%3d1',
    outFields: '*',
    resultRecordCount: maxRecordCount,
    resultOffset: offset,
    orderByFields: 'OBJECTID%20ASC',
  }
  const {features} = await esriApiQuery(params);
  return<EsriFeature[]> features;
}

export const getFeatureCountFromEsri = async () => {
  const params = {
    f: 'pjson',
    where: '1%3D1',
    outFields: '*',
    returnCountOnly: true,
  }
  const {count} = await esriApiQuery(params);
  return<number> count;
}

export const esriFieldObjToPgColumnObj = (fieldObj: EsriField) => {
  let type: string;
  let quote: boolean;
  switch (fieldObj.type) {
    case 'esriFieldTypeString':
      if (fieldObj['length']) {
        type = `CHARACTER VARYING(${fieldObj['length']})`;
      } else {
        type = 'TEXT';
      }
      quote = true;
      break;
    case 'esriFieldTypeOID':
      type = 'INTEGER UNIQUE';
      quote = false;
      break;
    case 'esriFieldTypeInteger':
      type = 'INTEGER';
      quote = false;
      break;
    case 'esriFieldTypeDouble':
      type = 'DOUBLE PRECISION';
      quote = false;
      break;
    case 'esriFieldTypeDate':
      type = 'BIGINT'
      quote = false;
      break;
    case 'esriFieldTypeGeometry':
      type = 'geometry';
      quote = true;
      break;
    default:
      type = 'TEXT';
      quote = true;
  }
  return <PgColumnObjType>{
    name: pgCleanFieldName(fieldObj.name.toLowerCase()),
    esriName: fieldObj.name,
    type,
    quote
  };
}

export const getLayerInfo = async () => {
  const {source, layer} = layerOpts;
  const layerUrl = `${source.url}${source.path}/${layer.dir}`;
  // log.debug({layerUrl})
  const {data: layerInfo} = await axios.get(`${layerUrl}?f=pjson`);
  // log.debug({layerInfo});
  return<EsriLayerInfo> layerInfo;
}

export const getLayerInfoFromEsri = async () => {
  const layerInfo: EsriLayerInfo = await getLayerInfo();
  // log.debug({layerInfo});
  let supportsPagination = false;
  if (layerInfo.advancedQueryCapabilities
    && layerInfo.advancedQueryCapabilities.supportsPagination) {
    supportsPagination = true;
  }
  const {
    fields,
    geometryField,
    maxRecordCount,
  } = layerInfo;
  const featureCount = await getFeatureCountFromEsri();

  return {
    fields,
    geometryField,
    maxRecordCount,
    supportsPagination,
    featureCount
  }
}

export const getAndPopulateRecordsFromEsri = async (
  layerInfo: any,
  offset: number = 0
) => {
  const features = await getFeaturesFromEsri(layerInfo.maxRecordCount, offset)
  // log.debug({features})
  if (features.length) {
    await populateStagingTableFromJson(
      layerInfo.fields, layerInfo.geometryField, features
    )
  }
  return features.length;
}

export const getAndPopulateAllRecordsFromEsri = async (
  layerInfo: any,
  offset: number = 0
) => {
  let numFeatures = layerInfo.maxRecordCount;
  while (numFeatures === layerInfo.maxRecordCount) {
    // TODO this should be done by comparing the total # of records
    //  retrieved to the total records in the source set
    numFeatures = await getAndPopulateRecordsFromEsri(layerInfo, offset);
    offset += numFeatures;
    log.debug({offset});
  }
}

export const loadEsriApiLayerToStaging = async () => {
  const {offset} = layerOpts;
  const layerInfo = await getLayerInfoFromEsri();
  log.debug({layerInfo, featureCount: layerInfo.featureCount});

  // layerInfo.maxRecordCount = 100;
  await createStagingTableFromJson(layerInfo.fields);

  if (layerInfo.featureCount > layerInfo.maxRecordCount) {
    if (layerInfo.supportsPagination) {
      await getAndPopulateAllRecordsFromEsri(layerInfo, offset);
    } else {
      // TODO: Where pagination is not supported, get all the id's and
      //  paginate that way
    }
  } else {
    await getAndPopulateRecordsFromEsri(layerInfo);
  }
}
