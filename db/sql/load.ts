import {pgQuery} from "../../lib/postgres.js";
import {getFieldsFromTable} from "../../lib/sql.js";

const getExcludedColumns = async () => {
  const {schema, layer} = layerOpts;
  const label = `get excluded columns for ${schema.base}.${layer.parentTable}`;
  const sql = `
      SELECT COALESCE(l.columns_exclude, ARRAY ['id', 'shape_invalid']) AS columns_exclude
      FROM layer_mgt.layer l
               LEFT JOIN layer_mgt.schema s ON (l.schema_id = s.id)
      WHERE s.base_schema = '${schema.base}'
        AND l.table_name = '${layer.parentTable}'
  `;
  const result: any = await pgQuery(sql, [], label, false)
  // log.info({result});
  return result[0].columns_exclude;
}

export const loadFromStagingToData = async () => {
  const {schema, layer} = layerOpts;
  log.info(`Transferring data from ${schema.staging}.${layer.stagingTable} to ${schema.data}.${layer.table}...`);

  try {
    const excludedColumns = await getExcludedColumns();
    const stagingFields = await getFieldsFromTable(
      schema.staging,
      layer.stagingTable,
      excludedColumns,
      true
    );
    const dataFields = await getFieldsFromTable(
      schema.data,
      layer.table,
      excludedColumns,
      true
    );
    // log.debug({stagingFields, dataFields});

    const label = `load ${layer.name} data from ${schema.staging}.${layer.stagingTable} into ${schema.data}.${layer.table}`;
    const sql = `
        WITH rows AS (
            INSERT
                INTO ${schema.data}.${layer.table} (${dataFields.join(',')})
                    SELECT ${stagingFields.join(',')}
                    FROM ${schema.staging}.${layer.stagingTable}
                    ON CONFLICT (${layer.pk}) DO NOTHING
                    RETURNING 1
        )
        SELECT count(*)
        FROM rows;
    `;
    const result: any = await pgQuery(sql, [], label, false)
    log.info(`Loaded ${result[0].count} ${layer.name} rows`);
    return result[0].count;
  } catch (e) {
    return Promise.reject(e);
  }
}

export const registerLayerInstance = async (
  description: string,
) => {
  const {schema, layer} = layerOpts;
  const label: string = 'register layer instance';
  const sql: string = `
      WITH layer_id AS (
          SELECT l.id
          FROM layer_mgt.layer l
                   LEFT JOIN layer_mgt.schema s ON (l.schema_id = s.id)
          WHERE s.base_schema = '${schema.base}'
            AND l.table_name = '${layer.parentTable}'
      )
      INSERT
      INTO layer_mgt.layer_instance (layer_id,
                                     description,
                                     table_name,
                                     created_at)
      VALUES ((SELECT id FROM layer_id),
              '${description}',
              '${layer.table}',
              NOW())
      ON CONFLICT(layer_id, table_name) DO UPDATE SET description = '${description}',
                                                      updated_at  = NOW()
      RETURNING id;
  `
  try {
    const rowId: { id: string }[] = await pgQuery(sql, [], label);
    // log.debug({instanceRowId: rowId[0].id});
    return rowId[0].id;
  } catch (e) {
    return Promise.reject(e);
  }
}
