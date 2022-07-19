const seq = 1.214;
const label = 'create layer_instance table';

export default {
  seq, label, sql: `
    DROP TABLE IF EXISTS layer_mgt.layer_instance CASCADE;
    CREATE TABLE layer_mgt.layer_instance
    (
      id UUID DEFAULT uuid_generate_v1(),
      layer_id UUID NOT NULL,
      description TEXT NOT NULL,
      table_name TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(id),
      FOREIGN KEY(layer_id)
          REFERENCES layer_mgt.layer(id)
          ON DELETE CASCADE,
      CONSTRAINT layer_instance_layer_id_table_name_key 
          UNIQUE ("layer_id", "table_name")
    );
  `
}
