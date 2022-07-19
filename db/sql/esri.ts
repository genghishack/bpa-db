import {arcgisToGeoJSON} from "@terraformer/arcgis";
import {pgCleanFieldName, pgCleanString, pgQuery} from "../../lib/postgres.js";
import {EsriFeature, EsriField} from "../../types/esri.js";
import {PgColumnObjType} from "../../types/etl.js";
import {esriFieldObjToPgColumnObj} from "../lib/esri.js";

export const createStagingTableFromJson = async (
  fields: EsriField[]
) => {
  const {schema, layer} = layerOpts;
  const columns = fields.map((fieldObj: any) => {
    const columnObj: PgColumnObjType = esriFieldObjToPgColumnObj(fieldObj);
    return `${columnObj.name} ${columnObj.type}`;
  })
  const label = 'create staging table from json';
  const sql = `
          DROP TABLE IF EXISTS ${schema.staging}.${layer.table} CASCADE;
          CREATE TABLE
              ${schema.staging}.${layer.table}
          (
              ${columns.join(',')}
          );
  `
  return pgQuery(sql, [], label);
}

export const populateStagingTableFromJson = async (
  fields: EsriField[],
  geometryField: EsriField,
  features: EsriFeature[]
) => {
  const {schema, layer} = layerOpts;
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
        // log.info(indexObj, pgCleanFieldName(key.toLowerCase()));
        return indexObj.name === pgCleanFieldName(key.toLowerCase());
      })
      const [columnObj] = columns.filter((column: PgColumnObjType) => {
        // log.info(column.ogName, featureObj.name);
        return column.esriName === key;
      })
      let value = 'NULL';
      if (featureObj.attributes[key] !== null) {
        value = featureObj.attributes[key];
      }
      // log.info({key, value})
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
    INSERT INTO ${schema.staging}.${layer.table}
    (${columnNames.join(',')}) VALUES
    ${rows.join(',')}
  `;
  // log.debug({sql});
  return pgQuery(sql, [], label);
}