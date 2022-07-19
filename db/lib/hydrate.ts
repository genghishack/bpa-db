import {
  addForeignKeyToTable, addGeomIndexToTable,
  addPKIndexToTable, addUniqueIndexToTable,
  checkTableExists,
  createChildTable,
  getAllIdsFromTable,
  insertIdsIntoTable
} from "../../lib/sql.js";
import {idObj} from "../../types/general.js";
import {
  findInvalidGeomsInDataTable,
  storeCentroids, storeCentroidsAsGeoJSONAndLatLng,
  storeGeomsAsGeoJSON, storePlusCodes,
  updateGeomTableWithCorrectedGeoms
} from "../sql/hydrate.js";

const createGeomDataTable = async () => {
  const {schema, layer} = layerOpts;
  const geomTableName = `geom_${layer.table}`;
  const geomParentTableName = `geom_${layer.parentTable}`;
  const geomTablePK = layer.pk;
  const geomTableFK = layer.pk;

  await createChildTable(schema.data, geomTableName, schema.base, geomParentTableName, false);
  await addPKIndexToTable(schema.data, geomTableName, geomTablePK);
  await addForeignKeyToTable(schema.data, geomTableName, geomTableFK, schema.data, layer.table, layer.pk);
  await addGeomIndexToTable(schema.data, geomTableName, 'shape_corrected');
  await addGeomIndexToTable(schema.data, geomTableName, 'centroid');
}

const populateIdsIntoGeomDataTable = async () => {
  const {schema, layer} = layerOpts;
  const geomTableName = `geom_${layer.table}`;

  log.info(`Creating id rows in ${schema.data}.${geomTableName} to match ${schema.data}.${layer.table}`);
  const ids: idObj[] = await getAllIdsFromTable(schema.data, layer.table, layer.pk);
  await insertIdsIntoTable(schema.data, geomTableName, layer.pk, ids);
}

const storeCorrectedGeometries = async () => {
  const {schema, layer} = layerOpts;
  const invalidIds: idObj[] = await findInvalidGeomsInDataTable();
  log.info(`rows with invalid geoms for ${schema.data}.${layer.table}:`, invalidIds.length);

  log.info(`Storing corrected geoms in ${schema.data}.geom_${layer.table}...`)
  await updateGeomTableWithCorrectedGeoms(invalidIds);
}

export const hydrateLayer = async () => {
  const {schema, layer} = layerOpts;
  log.info(`Hydrating ${schema.data}.${layer.table}...`);
  try {
    const tableExists = await checkTableExists(schema.data, layer.table);
    if (!tableExists) return {type: 'msg', value: `No ${schema.data}.${layer.table} exists.`};

    await createGeomDataTable();
    await populateIdsIntoGeomDataTable();
    await storeCorrectedGeometries();
    await storeCentroids();
    await storeGeomsAsGeoJSON();
    await storeCentroidsAsGeoJSONAndLatLng();
    // await storePlusCodes();

    return null;
  } catch (e) {
    return Promise.reject(e);
  }
}