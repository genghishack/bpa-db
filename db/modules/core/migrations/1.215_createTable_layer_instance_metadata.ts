const seq = 1.215;
const label = 'create layer_instance_metadata table';

export default {
  seq, label, sql: `
        DROP TABLE IF EXISTS layer_mgt.layer_instance_metadata CASCADE;
      CREATE TABLE layer_mgt.layer_instance_metadata
      (
          id                UUID DEFAULT uuid_generate_v1(),
          layer_instance_id UUID NOT NULL UNIQUE,
          metadata          TEXT,
          metadata_ea       TEXT,
          created_at        TIMESTAMP(6) WITH TIME ZONE DEFAULT NOW(),
          updated_at        TIMESTAMP(6) WITH TIME ZONE DEFAULT NOW(),

          PRIMARY KEY (id),
          FOREIGN KEY (layer_instance_id)
              REFERENCES layer_mgt.layer_instance (id)
              ON DELETE CASCADE
      );
  `
};
