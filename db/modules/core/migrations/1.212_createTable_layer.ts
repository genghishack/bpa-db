const seq = 1.212;
const label = 'create layer table';

export default {
  seq, label, sql: `
    DROP TABLE IF EXISTS layer_mgt.layer CASCADE;
    CREATE TABLE layer_mgt.layer
    (
      id                    UUID default uuid_generate_v1(),
      schema_id             UUID NOT NULL,
      layer_name            TEXT NOT NULL,
      layer_desc            TEXT,
      table_name            TEXT NOT NULL,
      pk_name               TEXT NOT NULL,
      load                  BOOLEAN DEFAULT true NOT NULL,
      level_county          BOOLEAN DEFAULT false NOT NULL,
      level_state           BOOLEAN DEFAULT false NOT NULL,
      level_nation          BOOLEAN DEFAULT false NOT NULL,
      columns_exclude       TEXT[],
      
      PRIMARY KEY (id),
      FOREIGN KEY (schema_id)
          REFERENCES layer_mgt.schema(id)
          ON DELETE CASCADE,
      CONSTRAINT layer_schema_id_table_name_key
          UNIQUE (schema_id, table_name)
    );
    COMMENT ON COLUMN layer_mgt.layer.table_name IS 
    'This is the table name to inherit from and suffix of resulting output table -- how the table will be named --  edges here would mean -- ma_edges , pa_edges etc. except in the case of national tables. national level tables have no prefix';
    COMMENT ON COLUMN layer_mgt.layer.level_nation IS 
    'These are tables that contain all data for the whole US so there is just a single file';
    COMMENT ON COLUMN layer_mgt.layer.columns_exclude IS 
    'List of columns to exclude as an array. This is excluded from both input table and output table and rest of columns remaining are assumed to be in same order in both tables.';
  `
}
