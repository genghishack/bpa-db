const seq = 112;
const label = 'create GIS Category table';

export default {
  seq, label, sql: `
  DROP TABLE IF EXISTS app.gis_category;
  CREATE TABLE
    app.gis_category
    (
        id UUID DEFAULT uuid_generate_v1() NOT NULL,
        name TEXT,
        properties_json JSONB,
        created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
        created_by UUID NOT NULL,
        updated_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
        updated_by UUID NOT NULL,
        PRIMARY KEY (id)
    );
  `
}
