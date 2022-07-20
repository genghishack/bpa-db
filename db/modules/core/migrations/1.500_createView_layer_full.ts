const seq = 1.500;
const label = 'create full layer view';

export default {
  seq, label, sql: `
  DROP VIEW IF EXISTS layer_mgt.v_layer_full;
  CREATE VIEW layer_mgt.v_layer_full AS
    SELECT l.id,
           s.steward_id,
           l.layer_name,
           l.layer_desc AS description,
           s.base_schema AS schema_name,
           l.table_name,
           l.load,
           count(li.*) AS instance_count,
           count(lim.*) AS metadata_count
    FROM layer_mgt.layer l 
             LEFT JOIN layer_mgt.schema s ON (l.schema_id = s.id)
             LEFT JOIN layer_mgt.layer_instance li ON (li.layer_id = l.id)
             LEFT JOIN layer_mgt.layer_instance_metadata lim ON (lim.layer_instance_id = li.id) 
    GROUP BY l.id,
             s.steward_id,
             l.layer_name,
             l.layer_desc,
             s.base_schema,
             l.table_name,
             l.load
  `
}
