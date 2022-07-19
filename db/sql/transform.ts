import {pgQuery} from "../../lib/postgres.js";
import {LayerOptions} from "../../types/etl.js";

export const renameStagingTableField = async (
  renameFrom: string,
  renameTo: string,
) => {
  const {schema, layer} = layerOpts;
  const label = `rename ${schema.staging}.${layer.table} field ${renameFrom} to ${renameTo}`;
  const sql = `
    ALTER TABLE ${schema.staging}.${layer.table} 
    RENAME ${renameFrom} TO ${renameTo};
  `;
  return pgQuery(sql, [], label);
}

export const addStagingTableField = async (
  fieldName: string,
  type: string,
) => {
  const {schema, layer} = layerOpts;
  const label = `add ${schema.staging}.${layer.table} field ${fieldName}`;
  const sql = `
    ALTER TABLE ${schema.staging}.${layer.table}
    ADD COLUMN ${fieldName} ${type}
  `;
  return pgQuery(sql, [], label);
}

export const addFIPSConstraintToDataTable = async (
  colName: string,
) => {
  const {schema, state, layer} = layerOpts;
  const label = 'add FIPS constraint';
  const sql = `
    ALTER TABLE ${schema.data}.${layer.table}
      ALTER COLUMN ${colName} SET DEFAULT '${state.fips}';
    ALTER TABLE ${schema.data}.${layer.table}
      ADD CONSTRAINT chk_${colName} CHECK (${colName} = '${state.fips}');
  `;
  return pgQuery(sql, [], label);
}

export const changeGeomSRIDsInDataTable = async (
  fieldName: string,
  srid: number,
) => {
  const {schema, layer} = layerOpts;
  const label = `change SRID for layer ${layer.name}`;
  const sql = `
    UPDATE ${schema.data}.${layer.table}
    SET shape = st_transform(${fieldName}, ${srid});
  `;
  return pgQuery(sql, [], label);
}

