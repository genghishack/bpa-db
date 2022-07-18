const seq = 1.217;
const label = 'create layer table';

export default {
  seq, label, sql: `
      DROP TABLE IF EXISTS layer_mgt.layer CASCADE;
      CREATE TABLE layer_mgt.layer (
        id UUID DEFAULT uuid_generate_v1(),
        steward_id UUID,
        layer_name TEXT NOT NULL,
        schema_name TEXT,
        table_name TEXT,
        description TEXT,
        source_layer TEXT,
        source_location TEXT,
--        cloudvault_location TEXT,
        mac_location TEXT,
--        oracle_table TEXT,

        PRIMARY KEY (id),
        FOREIGN KEY (steward_id)
          REFERENCES layer_mgt.layer_steward(id),
        CONSTRAINT layer_schema_name_table_name_fkey
            FOREIGN KEY (schema_name, table_name)
            REFERENCES layer_mgt.layer_config_table (schema_name, table_name)
      );
  `
}
