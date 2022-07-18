const seq = 1.212;
const label = 'create layer_config_table table';

export default {
  seq, label, sql: `
    DROP TABLE IF EXISTS layer_mgt.layer_config_table CASCADE;
    CREATE TABLE layer_mgt.layer_config_table
    (
      id                    UUID default uuid_generate_v1(),
      schema_name           TEXT NOT NULL,
      table_name            TEXT NOT NULL,
      pk_name               TEXT NOT NULL,
      layer_name            TEXT NOT NULL,
      load                  BOOLEAN DEFAULT true NOT NULL,
      level_county          BOOLEAN DEFAULT false NOT NULL,
      level_state           BOOLEAN DEFAULT false NOT NULL,
      level_nation          BOOLEAN DEFAULT false NOT NULL,
      columns_exclude       TEXT[],
      PRIMARY KEY (id),
      CONSTRAINT layer_config_table_schema_name_fkey
          FOREIGN KEY (schema_name)
          REFERENCES layer_mgt.layer_config_schema(base_schema),
      CONSTRAINT layer_config_table_schema_name_table_name_key
          UNIQUE (schema_name, table_name)
    );
    COMMENT ON COLUMN layer_mgt.layer_config_table.table_name IS 
    'This is the table name to inherit from and suffix of resulting output table -- how the table will be named --  edges here would mean -- ma_edges , pa_edges etc. except in the case of national tables. national level tables have no prefix';
    COMMENT ON COLUMN layer_mgt.layer_config_table.level_nation IS 
    'These are tables that contain all data for the whole US so there is just a single file';
    COMMENT ON COLUMN layer_mgt.layer_config_table.columns_exclude IS 
    'List of columns to exclude as an array. This is excluded from both input table and output table and rest of columns remaining are assumed to be in same order in both tables.';
  `
}
