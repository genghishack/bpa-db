const seq = 113;
const label = 'create GIS resource/category cross table';

export default {
  seq, label, sql: `
    DROP TABLE IF EXISTS app.gis_resource_x_category;
    CREATE TABLE
    app.gis_resource_x_category
    (
        id UUID DEFAULT uuid_generate_v1() NOT NULL,
        resource_id UUID,
        category_id UUID,
        created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
        created_by UUID NOT NULL,
        updated_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
        updated_by UUID NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (category_id) 
            REFERENCES app.gis_category (id) 
                ON DELETE CASCADE,
        FOREIGN KEY (resource_id) 
            REFERENCES app.gis_resource (id)
                ON DELETE CASCADE
    );
  `
}
