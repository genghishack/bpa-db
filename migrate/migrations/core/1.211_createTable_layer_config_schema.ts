const seq = 1.211;
const label = 'create layer_config_schema table';

export default {
  seq, label, sql: `
    DROP TABLE IF EXISTS layer_mgt.layer_config_schema CASCADE;
    CREATE TABLE layer_mgt.layer_config_schema
    ( 
      base_schema    TEXT NOT NULL,
      data_schema    TEXT NOT NULL,
      staging_schema TEXT NOT NULL,
      web_root        TEXT,
      ftp_root        TEXT,
      base_path      TEXT,
      
      PRIMARY KEY (base_schema),
      CONSTRAINT layer_config_schema_data_schema_key UNIQUE (data_schema),
      CONSTRAINT layer_config_schema_staging_schema_key UNIQUE (staging_schema)
    );
  `
}