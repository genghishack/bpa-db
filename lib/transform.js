import {pgQuery} from "./postgres.js";
import {logDebug} from "./logging.js";

export const renameStagingTableField = async (schema, tableName, renameFrom, renameTo) => {
  const label = `rename ${schema}_staging.${tableName} field ${renameFrom} to ${renameTo}`;
  const sql = `ALTER TABLE ${schema}_staging.${tableName} RENAME ${renameFrom} TO ${renameTo};`;
  try {
    await pgQuery(sql, [], label);
  } catch (e) {
    return Promise.reject(e)
  }
}

export const addFIPSConstraintToDataTable = async (schema, tableName, colName, fips) => {
  const label = 'add FIPS constraint';
  const sql = `
    ALTER TABLE ${schema}_data.${tableName}
      ALTER COLUMN ${colName} SET DEFAULT '${fips}';
    ALTER TABLE ${schema}_data.${tableName}
      ADD CONSTRAINT chk_${colName} CHECK (${colName} = '${fips}');
  `;
  try {
    await pgQuery(sql, [], label);
  } catch (e) {
    return Promise.reject(e);
  }
}

export const validateGeomsInDataTable = async (schema, tableName, geomName, pk) => {
  logDebug('Validating and fixing geometries...');
  // const invalidIds = await common.findInvalidGeoms(schema, tableName, geomName)
  // logDebug({invalidIds})
  const label = 'validate and fix geometries';
  const sql = `
    WITH
    test_validity AS (
        SELECT ${pk}, st_isvalid(${geomName}) as valid FROM ${schema}_data.${tableName}
    )
    ,copy_invalids AS (
      UPDATE ${schema}_data.${tableName}
      SET ${geomName}_invalid = ${geomName}
      WHERE ${pk} IN (
        SELECT ${pk} FROM test_validity WHERE valid = false
      )
    )
    ,fix_invalids AS (
      UPDATE ${schema}_data.${tableName}
      SET ${geomName} = st_makevalid(${geomName}_invalid) 
      WHERE ${geomName}_invalid IS NOT NULL
      RETURNING ${pk}
    )
    SELECT ${pk} FROM ${schema}_data.${tableName}
    WHERE ${pk} IN (
      SELECT ${pk} FROM fix_invalids
    ) AND st_isvalid(${geomName}) = false;
  `
  try {
    return pgQuery(sql, [], label);
  } catch (e) {
    return Promise.reject(e);
  }
}

export const changeGeomSRIDsInDataTable = async (schema, tableName, layerName, fieldName, srid) => {
  const label = `change SRID for layer ${layerName}`;
  const sql = `
    UPDATE ${schema}_data.${tableName}
    SET shape = st_transform(${fieldName}, ${srid});
  `;
  try {
    return pgQuery(sql, [], label);
  } catch (e) {
    return Promise.reject(e);
  }
}

