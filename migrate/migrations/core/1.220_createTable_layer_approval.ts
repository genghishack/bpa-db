const seq = 1.220;
const label = 'create layer_approval table';

export default {
  seq, label, sql: `
      DROP TABLE IF EXISTS layer_mgt.layer_approval CASCADE;
      CREATE TABLE layer_mgt.layer_approval (
        id UUID DEFAULT uuid_generate_v1(),
        layer_id UUID,
        data_loaded BOOLEAN,
        approval_sandbox BOOLEAN,
        jira_approval_sandbox TEXT,
        approval_dev BOOLEAN,
        jira_approval_dev TEXT,
        approval_prod BOOLEAN,
        jira_approval_prod TEXT,
        scan_complete BOOLEAN,
        scan_provided BOOLEAN,
        jira_scan_provided TEXT,
        approval_pta_pia BOOLEAN,
        
        PRIMARY KEY (id),
        FOREIGN KEY (layer_id)
          REFERENCES layer_mgt.layer (id)
      );
  `
};
