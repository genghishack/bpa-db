import {pgCleanString, pgQuery} from "../../lib/postgres.js";
import {LayerOptions} from "../../types/etl.js";

export const storeMetaDataInDB = async (
  metadata: any,
  instanceId: string,
) => {
  const label = 'store metadata';
  let rMetadata = [];
  if (metadata instanceof Array) {
    rMetadata = metadata;
  } else {
    rMetadata = [metadata];
  }
  const metadata_json = JSON.stringify(rMetadata);
  const sql = `
    INSERT INTO layer_mgt.layer_instance_metadata (
      layer_instance_id, 
      metadata_json
    )
    VALUES (
                   '${instanceId}',
                   '${pgCleanString(metadata_json)}'
    )
    ON CONFLICT (layer_instance_id) DO
    UPDATE SET 
      metadata_json = '${pgCleanString(metadata_json)}',
      updated_at = NOW();
  `;
  return pgQuery(sql, [], label);
}

export const getLayerInstanceId = async () => {
  const {schema, layer} = layerOpts;
  const label = 'get layer instance id';
  const sql = `
      SELECT li.id
      FROM layer_mgt.layer_instance li
               LEFT JOIN layer_mgt.layer l ON (l.id = li.layer_id)
               LEFT JOIN layer_mgt.schema s ON (l.schema_id = s.id)
      WHERE s.base_schema = '${schema.base}'
        AND l.table_name = '${layer.parentTable}'
        AND li.table_name = '${layer.table}'
  `
  try {
    const rowId: { id: string }[] = await pgQuery(sql, [], label);
    // log.debug({instanceRowId: rowId[0].id});
    if (rowId.length && rowId[0].id) return rowId[0].id;
    return null;
  } catch (e) {
    return Promise.reject(e);
  }
}