const seq = 110;
const label = 'create GIS Resource Status table';

export default {
  seq, label, sql: `
    DROP TABLE IF EXISTS app.gis_resource_status;
    CREATE TABLE 
        app.gis_resource_status
    (
        id UUID DEFAULT uuid_generate_v1(),
        name TEXT NOT NULL,
        properties_json JSONB,
        created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
        created_by UUID NOT NULL,
        updated_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
        updated_by UUID NOT NULL,
        PRIMARY KEY (id)
    )
  `
}
