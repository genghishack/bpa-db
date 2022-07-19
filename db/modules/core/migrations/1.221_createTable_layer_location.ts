const seq = 1.217;
const label = 'create layer table';

export default {
  seq, label, sql: `
        DROP TABLE IF EXISTS layer_mgt.layer_location CASCADE;
        CREATE TABLE layer_mgt.layer_location
        (
            id                  UUID DEFAULT uuid_generate_v1(),
            layer_id            UUID,
            source_layer        TEXT,
            source_location     TEXT,
            cloudvault_location TEXT,
            mac_location        TEXT,
            oracle_table        TEXT,

            PRIMARY KEY (id),
            FOREIGN KEY (layer_id)
                REFERENCES layer_mgt.layer (id)
                ON DELETE CASCADE
        );
  `
}
