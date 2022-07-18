const seq = 111;
const label = 'create GIS Resource table';

export default {
  seq, label, sql: `
    DROP TABLE IF EXISTS app.gis_resource;
    CREATE TABLE app.gis_resource
    (
        id UUID DEFAULT uuid_generate_v1(),
        status_id UUID,
        name_json JSONB NOT NULL,
        address_json JSONB,
        phone_json JSONB,
        internet_json JSONB,
        other_json JSONB,
        description TEXT,
        lat DOUBLE PRECISION,
        lng DOUBLE PRECISION,
        shape geometry,
        created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
        created_by UUID NOT NULL,
        updated_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
        updated_by UUID NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (status_id)
            REFERENCES app.gis_resource_status (id)
                ON DELETE SET NULL
    );
  `
};
