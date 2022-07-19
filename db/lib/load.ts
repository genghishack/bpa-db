import {checkFieldExistsInTable, createChildTable, addPKIndexToTable, addForeignKeyToTable} from "../../lib/sql.js";

export const createDataTables = async (
) => {
  const {schema, layer} = layerOpts;
  await createChildTable(schema.data, layer.table, schema.base, layer.parentTable);
  await addPKIndexToTable(schema.data, layer.table, layer.pk);
}

export const checkFieldExistsInStagingTable = async (
  fieldName: string,
) => {
  const {schema, layer} = layerOpts;
  return checkFieldExistsInTable(
    schema.staging,
    layer.table,
    fieldName,
  );
}

