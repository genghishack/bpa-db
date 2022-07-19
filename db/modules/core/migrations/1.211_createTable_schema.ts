const seq = 1.211;
const label = 'create schema table';

export default {
  seq, label, sql: `
        DROP TABLE IF EXISTS layer_mgt.schema CASCADE;
        CREATE TABLE layer_mgt.schema
        (
            id             UUID default uuid_generate_v1(),
            steward_id     UUID,
            base_schema    TEXT UNIQUE NOT NULL,
            data_schema    TEXT UNIQUE NOT NULL,
            staging_schema TEXT UNIQUE NOT NULL,
            web_root       TEXT,
            ftp_root       TEXT,
            base_path      TEXT,

            PRIMARY KEY (id),
            FOREIGN KEY (steward_id)
                REFERENCES layer_mgt.steward (id)
                ON DELETE SET NULL
        );
  `
}
