import {LayerOptions} from "../types/etl.js";
import {pgQuery} from "./postgres.js";

export const renameStagingTableField = async (
  renameFrom: string,
  renameTo: string,
  opts: LayerOptions
) => {
  const label = `rename ${opts.schema.staging}.${opts.layer.table} field ${renameFrom} to ${renameTo}`;
  const sql = `
    ALTER TABLE ${opts.schema.staging}.${opts.layer.table} 
    RENAME ${renameFrom} TO ${renameTo};
  `;
  return pgQuery(sql, [], label);
}

export const addStagingTableField = async (
  fieldName: string,
  type: string,
  opts: LayerOptions
) => {
  const label = `add ${opts.schema.staging}.${opts.layer.table} field ${fieldName}`;
  const sql = `
    ALTER TABLE ${opts.schema.staging}.${opts.layer.table}
    ADD COLUMN ${fieldName} ${type}
  `;
  return pgQuery(sql, [], label);
}

export const addFIPSConstraintToDataTable = async (
  colName: string,
  opts: LayerOptions
) => {
  const label = 'add FIPS constraint';
  const sql = `
    ALTER TABLE ${opts.schema.data}.${opts.layer.table}
      ALTER COLUMN ${colName} SET DEFAULT '${opts.state.fips}';
    ALTER TABLE ${opts.schema.data}.${opts.layer.table}
      ADD CONSTRAINT chk_${colName} CHECK (${colName} = '${opts.state.fips}');
  `;
  return pgQuery(sql, [], label);
}

export const changeGeomSRIDsInDataTable = async (
  fieldName: string,
  srid: number,
  opts: LayerOptions
) => {
  const label = `change SRID for layer ${opts.layer.name}`;
  const sql = `
    UPDATE ${opts.schema.data}.${opts.layer.table}
    SET shape = st_transform(${fieldName}, ${srid});
  `;
  return pgQuery(sql, [], label);
}

export const renameStagingFields = async (opts: LayerOptions) => {
  try {
    if (opts.layer.table === 'us_hzbldg_count_occupb_res') {
      await addStagingTableField('com1i', 'DOUBLE PRECISION', opts);
      await addStagingTableField('com2i', 'DOUBLE PRECISION', opts);
      await addStagingTableField('com3i', 'DOUBLE PRECISION', opts);
      await addStagingTableField('com4i', 'DOUBLE PRECISION', opts);
      await addStagingTableField('com5i', 'DOUBLE PRECISION', opts);
      await addStagingTableField('com6i', 'DOUBLE PRECISION', opts);
      await addStagingTableField('com7i', 'DOUBLE PRECISION', opts);
      await addStagingTableField('com8i', 'DOUBLE PRECISION', opts);
      await addStagingTableField('com9i', 'DOUBLE PRECISION', opts);
      await addStagingTableField('com10i', 'DOUBLE PRECISION', opts);
      await addStagingTableField('ind1i', 'DOUBLE PRECISION', opts);
      await addStagingTableField('ind2i', 'DOUBLE PRECISION', opts);
      await addStagingTableField('ind3i', 'DOUBLE PRECISION', opts);
      await addStagingTableField('ind4i', 'DOUBLE PRECISION', opts);
      await addStagingTableField('ind5i', 'DOUBLE PRECISION', opts);
      await addStagingTableField('ind6i', 'DOUBLE PRECISION', opts);
      await addStagingTableField('agr1i', 'DOUBLE PRECISION', opts);
      await addStagingTableField('rel1i', 'DOUBLE PRECISION', opts);
      await addStagingTableField('gov1i', 'DOUBLE PRECISION', opts);
      await addStagingTableField('gov2i', 'DOUBLE PRECISION', opts);
      await addStagingTableField('edu1i', 'DOUBLE PRECISION', opts);
      await addStagingTableField('edu2i', 'DOUBLE PRECISION', opts);
    }
    return null;
  } catch (e) {
    return e;
  }
}
