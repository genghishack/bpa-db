import {getAllIdsFromTable} from "../../lib/sql.js";

export const getAllIdsFromDataTable = async () => {
  const {schema, layer} = layerOpts;
  return getAllIdsFromTable(
    schema.data,
    layer.table
  )
}