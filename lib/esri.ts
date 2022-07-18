import {arcgisToGeoJSON} from '@terraformer/arcgis';
import axios from "axios";
import {LayerOptions, PgColumnObjType} from "../types/etl.js";
import {getQueryStr} from "./utils.js";
import {logDebug} from "./logging.js";
import {pgCleanFieldName, pgCleanString, pgQuery} from "./postgres.js";
import {EsriFeature, EsriField, EsriLayerInfo} from "../types/esri.js";

export const getLayerInfo = async (opts: LayerOptions) => {
  const layerUrl = `${opts.source.url}${opts.source.path}/${opts.layer.dir}`;
  const {data: layerInfo} = await axios.get(`${layerUrl}?f=pjson`);
  return<EsriLayerInfo> layerInfo;
}

export const apiQuery = async (params: any, opts: LayerOptions) => {
  const layerUrl = `${opts.source.url}${opts.source.path}/${opts.layer.dir}`;
  const queryUrl = `${layerUrl}/query?${getQueryStr(params)}`;
  logDebug({queryUrl});
  const {data}:any = await axios({
    method: 'get',
    url: queryUrl,
  });
  // logDebug({data})
  return data;
}

export const getFeatures = async (
  opts: LayerOptions,
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
  const {features} = await apiQuery(params, opts);
  return<EsriFeature[]> features;
}

export const getFeatureCount = async (opts: LayerOptions) => {
  const params = {
    f: 'pjson',
    where: '1%3D1',
    outFields: '*',
    returnCountOnly: true,
  }
  const {count} = await apiQuery(params, opts);
  return<number> count;
}

export const esriFieldObjToPgColumnObj = (fieldObj: EsriField) => {
  let type: string = '';
  let quote: boolean = true;
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

export const createStagingTableFromJson = async (
  opts: LayerOptions,
  fields: EsriField[]
) => {
  const columns = fields.map((fieldObj: any) => {
    const columnObj: PgColumnObjType = esriFieldObjToPgColumnObj(fieldObj);
    return `${columnObj.name} ${columnObj.type}`;
  })
  const label = 'create staging table from json';
  const sql = `
          DROP TABLE IF EXISTS ${opts.schema.staging}.${opts.layer.table} CASCADE;
          CREATE TABLE
              ${opts.schema.staging}.${opts.layer.table}
          (
              ${columns.join(',')}
          );
  `
  return pgQuery(sql, [], label);
}

export const populateStagingTableFromJson = async (
  opts: LayerOptions,
  fields: EsriField[],
  geometryField: EsriField,
  features: EsriFeature[]
) => {
  type idxObj = {
    name: string;
    index: number;
  }
  const columns = fields.map((fieldObj: EsriField) => {
    const columnObj: PgColumnObjType = esriFieldObjToPgColumnObj(fieldObj);
    return columnObj;
  });
  const columnNames = columns.map((columnObj: PgColumnObjType) => {
    return columnObj.name;
  })
  const columnIndexes: idxObj[] = columnNames.map((string: string, idx: number) => {
    return {name: string, index: idx}
  })
  const rows = features.map((featureObj: any) => {
    const row: any = [];
    Object.keys(featureObj.attributes).forEach((key: string) => {
      const [columnIndex] = columnIndexes.filter((indexObj: idxObj) => {
        // console.log(indexObj, pgCleanFieldName(key.toLowerCase()));
        return indexObj.name === pgCleanFieldName(key.toLowerCase());
      })
      const [columnObj] = columns.filter((column: PgColumnObjType) => {
        // console.log(column.ogName, featureObj.name);
        return column.esriName === key;
      })
      let value = 'NULL';
      if (featureObj.attributes[key] !== null) {
        value = featureObj.attributes[key];
      }
      // console.log({key, value})
      row[columnIndex.index] = (columnObj.quote && value !== 'NULL')
        ? `'${pgCleanString(value.toString())}'`
        : value;
    })
    const [geomIndex] = columnIndexes.filter((indexObj: idxObj) => {
      let geomFieldName = 'shape';
      if (geometryField) {
        geomFieldName = geometryField.name.toLowerCase();
      // } else {
      //   const [geomField] = fields.filter((fieldObj: EsriField) => {
      //     return fieldObj.type === 'EsriTypeFieldGeometry';
      //   })
      //   geomFieldName = geomField.name;
      }
      return indexObj.name === pgCleanFieldName(geomFieldName);
    })

    if (featureObj.geometry) {
      const geom = arcgisToGeoJSON(featureObj.geometry);
      row[geomIndex.index] = `ST_GeomFromGeoJSON('${JSON.stringify(geom)}')`;
    } else {
      if (geomIndex) {
        row[geomIndex.index] = 'NULL';
      }
    }
    return `(${row.join(',')})`;
  });

  const label = 'populate staging table from json';
  const sql = `
    INSERT INTO ${opts.schema.staging}.${opts.layer.table}
    (${columnNames.join(',')}) VALUES
    ${rows.join(',')}
  `;
  // logDebug({sql});
  return pgQuery(sql, [], label);
}

export const getLayerInfoFromEsri = async (
  opts: LayerOptions
) => {
  const layerInfo: EsriLayerInfo = await getLayerInfo(opts);
  // logDebug({layerInfo});
  const {
    fields,
    geometryField,
    maxRecordCount,
    advancedQueryCapabilities: {supportsPagination}
  } = layerInfo;
  const featureCount = await getFeatureCount(opts);

  return {
    fields,
    geometryField,
    maxRecordCount,
    supportsPagination,
    featureCount
  }
}

export const getAndPopulateRecordsFromEsri = async (
  opts: LayerOptions,
  layerInfo: any,
  offset: number = 0
) => {
  const features = await getFeatures(opts, layerInfo.maxRecordCount, offset)
  // logDebug({features})
  if (features.length) {
    await populateStagingTableFromJson(
      opts, layerInfo.fields, layerInfo.geometryField, features
    )
  }
  return features.length;
}

export const getAndPopulateAllRecordsFromEsri = async (
  opts: LayerOptions,
  layerInfo: any,
  offset: number = 0
) => {
  let numFeatures = layerInfo.maxRecordCount;
  while (numFeatures === layerInfo.maxRecordCount) {
    // TODO this should be done by comparing the total # of records
    //  retrieved to the total records in the source set
    numFeatures = await getAndPopulateRecordsFromEsri(opts, layerInfo, offset);
    offset += numFeatures;
    logDebug({offset});
  }
}

export const loadEsriApiLayerToStaging = async (opts: LayerOptions) => {
  const layerInfo = await getLayerInfoFromEsri(opts);
  logDebug({featureCount: layerInfo.featureCount});

  // layerInfo.maxRecordCount = 100;
  await createStagingTableFromJson(opts, layerInfo.fields);

  if (layerInfo.featureCount > layerInfo.maxRecordCount) {
    if (layerInfo.supportsPagination) {
      await getAndPopulateAllRecordsFromEsri(opts, layerInfo, opts.offset);
    } else {
      // TODO: Do something crazy like get all the id's and
      //  paginate that way
    }
  } else {
    await getAndPopulateRecordsFromEsri(opts, layerInfo);
  }
}
