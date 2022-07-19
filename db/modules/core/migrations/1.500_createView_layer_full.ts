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
           ls.steward_name,
           ll.source_layer,
           ll.source_location,
           ll.cloudvault_location,
           ll.mac_location,
           ll.oracle_table,
           lr.example_filename,
           lr.example_filesize,
           lr.example_num_recs,
           lr.example_num_cols,
           lr.documentation_requirements,
           lr.application_goal,
           lr.data_elements,
           lr.geom_type,
           lr.source_crs,
           lr.cost_estimates,
           lr.jira_review,
           lr.need_determination,
           la.data_loaded,
           la.approval_sandbox,
           la.jira_approval_sandbox,
           la.approval_dev,
           la.jira_approval_dev,
           la.approval_prod,
           la.jira_approval_prod,
           la.scan_complete,
           la.scan_provided,
           la.jira_scan_provided,
           la.approval_pta_pia,
           count(li.*) AS instance_count,
           count(lim.*) AS metadata_count
    FROM layer_mgt.layer l 
             LEFT JOIN layer_mgt.schema s ON (l.schema_id = s.id)
             LEFT JOIN layer_mgt.steward ls ON (s.steward_id = ls.id)
             LEFT JOIN layer_mgt.layer_review lr ON (lr.layer_id = l.id)
             LEFT JOIN layer_mgt.layer_approval la ON (la.layer_id = l.id)
             LEFT JOIN layer_mgt.layer_location ll ON (ll.layer_id = l.id)
             LEFT JOIN layer_mgt.layer_instance li ON (li.layer_id = l.id)
             LEFT JOIN layer_mgt.layer_instance_metadata lim ON (lim.layer_instance_id = li.id) 
    GROUP BY l.id,
             s.steward_id,
             l.layer_name,
             l.layer_desc,
             s.base_schema,
             l.table_name,
             l.load,
             ls.steward_name,
             ll.source_layer,
             ll.source_location,
             ll.cloudvault_location,
             ll.mac_location,
             ll.oracle_table,
             lr.example_filename,
             lr.example_filesize,
             lr.example_num_recs,
             lr.example_num_cols,
             lr.documentation_requirements,
             lr.application_goal,
             lr.data_elements,
             lr.geom_type,
             lr.source_crs,
             lr.cost_estimates,
             lr.jira_review,
             lr.need_determination,
             la.data_loaded,
             la.approval_sandbox,
             la.jira_approval_sandbox,
             la.approval_dev,
             la.jira_approval_dev,
             la.approval_prod,
             la.jira_approval_prod,
             la.scan_complete,
             la.scan_provided,
             la.jira_scan_provided,
             la.approval_pta_pia;
  `
}
