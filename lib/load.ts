import {LayerOptions} from "../types/etl.js";
import {logDebug} from "./logging.js";
import {pgQuery} from "./postgres.js";

export const loadFromStagingToData = async (opts: LayerOptions) => {
  console.log('Transferring data from staging table to data table...');
  logDebug({tableName: opts.layer.table});
  const label = `load ${opts.layer.name} data from staging into data table`;
  const sql = `
    SELECT layer_mgt.load_staged_data(lower('${opts.schema.base}'), lower('${opts.layer.table}'), lower('${opts.layer.table}'), lower('${opts.layer.pk}'));
  `;
  // logDebug({sql})
  try {
    const dataLoad: { load_staged_data: number }[] = await pgQuery(sql, [], label);
    console.log(`Loaded ${dataLoad[0].load_staged_data} ${opts.layer.name} rows`);
  } catch (e) {
    return Promise.reject(e);
  }
}

export const registerLayerInstance = async (
  description: string,
  opts: LayerOptions
) => {
  const label: string = 'register layer instance';
  const sql: string = `
    INSERT INTO layer_mgt.layer_instance (
      parent_schema,
      parent_table,
      description, 
      schema_name, 
      table_name
    ) 
    VALUES (
      '${opts.schema.base}',
      '${opts.layer.parentTable}',
      '${description}', 
      '${opts.schema.data}', 
      '${opts.layer.table}'
    )
    ON CONFLICT(schema_name, table_name) DO
    UPDATE SET 
      parent_schema = '${opts.schema.base}',
      parent_table = '${opts.layer.parentTable}',
      description = '${description}',
      updated_at = NOW()
    RETURNING id;
  `
  try {
    const rowId: { id: string }[] = await pgQuery(sql, [], label);
    // logDebug({instanceRowId: rowId[0].id});
    return rowId[0].id;
  } catch (e) {
    return Promise.reject(e);
  }
}

