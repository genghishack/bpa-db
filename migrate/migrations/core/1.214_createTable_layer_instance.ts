const seq = 1.214;
const label = 'create layer_instance table';

export default {
  seq, label, sql: `
    DROP TABLE IF EXISTS layer_mgt.layer_instance CASCADE;
    CREATE TABLE layer_mgt.layer_instance
    (
      id UUID DEFAULT uuid_generate_v1(),
      parent_schema TEXT NOT NULL,
      parent_table TEXT NOT NULL,
      description TEXT NOT NULL,
      schema_name TEXT NOT NULL,
      table_name TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(id),
      CONSTRAINT layer_instance_schema_name_table_name_key 
          UNIQUE ("schema_name", "table_name"),
      CONSTRAINT layer_instance_parent_schema_parent_table_fkey
          FOREIGN KEY (parent_schema, parent_table)
          REFERENCES layer_mgt.layer_config_table(schema_name, table_name),
      CONSTRAINT layer_instance_schema_name_fkey
          FOREIGN KEY (schema_name)
          REFERENCES layer_mgt.layer_config_schema(data_schema)
    );
  `
}
