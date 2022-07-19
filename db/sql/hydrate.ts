import {pgQuery} from "../../lib/postgres.js";
import {getAllIdsFromTable, iterateWithGroupedSQL} from "../../lib/sql.js";
import {idObj} from "../../types/general.js";

export const findInvalidGeomsInDataTable = async () => {
  const {schema, layer} = layerOpts;
  log.info(`Finding invalid geometries in ${schema.data}.${layer.table}...`);
  const label = 'find invalid geometries';
  const sql = `
      SELECT ${layer.pk}
      FROM ${schema.data}.${layer.table}
      WHERE st_isvalid(shape) = false;
  `
  return pgQuery(sql, [], label);
}

export const updateGeomTableWithCorrectedGeoms = async (
  invalidIds: idObj[]
) => {
  const {schema, layer} = layerOpts;
  const geomTableName = `geom_${layer.table}`;
  const groupSize = 1000;
  const label = `store corrected geoms from ${schema.data}.${layer.table} into ${schema.data}.${geomTableName}`;

  await iterateWithGroupedSQL(invalidIds, groupSize, label, (idObj: idObj) => {
    return `
      UPDATE ${schema.data}.${geomTableName} 
      SET shape_corrected = st_makevalid((
          SELECT shape FROM ${schema.data}.${layer.table}
          WHERE ${layer.pk} = '${idObj.id}'
      ))
      WHERE ${layer.pk} = '${idObj.id}';
    `
  }, false);
}

const getSQLForValidGeom = (idObj: idObj) => {
  const {schema, layer} = layerOpts;
  const geomTableName = `geom_${layer.table}`;
  return `
      SELECT COALESCE(a.shape_corrected, b.shape)
      FROM ${schema.data}.${geomTableName} a
          LEFT JOIN ${schema.data}.${layer.table} b ON (a.${layer.pk} = b.${layer.pk})
      WHERE a.${layer.pk} = '${idObj.id}'
  `
}

export const storeGeomsAsGeoJSON = async () => {
  const {schema, layer} = layerOpts;
  const geomTableName = `geom_${layer.table}`;
  const groupSize = 10000;
  log.info(`Storing ${schema.data}.${layer.table} and ${schema.data}.${geomTableName} geoms as GeoJSON...`)
  const geomIds: idObj[] = await getAllIdsFromTable(schema.data, geomTableName, layer.pk);
  const label = `store ${schema.data}.${layer.table} and ${schema.data}.${geomTableName} geoms as GeoJSON`;

  await iterateWithGroupedSQL(geomIds, groupSize, label, (idObj: idObj) => {
    return `
        UPDATE ${schema.data}.${geomTableName}
        SET shape_geojson = ST_AsGeoJSON((
            ${getSQLForValidGeom(idObj)}
        ))::JSONB
        WHERE ${layer.pk} = '${idObj.id}';
    `
  }, false);
}

export const storeCentroids = async () => {
  const {schema, layer} = layerOpts;
  const geomTableName = `geom_${layer.table}`;
  const groupSize = 10000;
  log.info(`Storing centroids in ${schema.data}.${geomTableName}...`)
  const geomIds: idObj[] = await getAllIdsFromTable(schema.data, geomTableName, layer.pk);
  const label = `store centroids in ${schema.data}.${geomTableName}`

  await iterateWithGroupedSQL(geomIds, groupSize, label, (idObj: idObj) => {
    return `
      UPDATE ${schema.data}.${geomTableName}
      SET centroid = ST_SetSRID(ST_Centroid((
          ${getSQLForValidGeom(idObj)}
      )), 4326)
      WHERE ${layer.pk} = '${idObj.id}';
    `
  }, false)
}

export const storeCentroidsAsGeoJSONAndLatLng = async () => {
  const {schema, layer} = layerOpts;
  const geomTableName = `geom_${layer.table}`;
  const groupSize = 10000;
  log.info(`Storing ${schema.data}.${geomTableName} centroids as GeoJSON and lat/lng...`)
  const geomIds: idObj[] = await getAllIdsFromTable(schema.data, geomTableName, layer.pk);
  const label = `store ${schema.data}.${geomTableName} centroids as GeoJSON and lat/lng`;

  await iterateWithGroupedSQL(geomIds, groupSize, label, (idObj: idObj) => {
    return `
        UPDATE ${schema.data}.${geomTableName}
        SET centroid_geojson = ST_AsGeoJSON(centroid)::JSONB,
            centroid_lat = ST_X(centroid),
            centroid_lng = ST_Y(centroid)
        WHERE ${layer.pk} = '${idObj.id}';
    `
  }, false);
}

export const storePlusCodes = async () => {
  const {schema, layer} = layerOpts;
  const geomTableName = `geom_${layer.table}`;
  const groupSize = 10000;
  log.info(`Converting ${schema.data}.${geomTableName} lat/lngs to pluscodes...`)
  const geomIds: idObj[] = await getAllIdsFromTable(schema.data, geomTableName, layer.pk);
  const label = `convert ${schema.data}.${geomTableName} lat/lngs to pluscodes`;

  await iterateWithGroupedSQL(geomIds, groupSize, label, (idObj: idObj) => {
    return `
      UPDATE ${schema.data}.${geomTableName}
      SET pluscode = (pluscode_encode(centroid_lat::numeric, centroid_lng::numeric, 19))
      WHERE ${layer.pk} = '${idObj.id}';
    `
  }, false);
}
