const seq = 1.218;
const label = 'create layer_review table';

export default {
  seq, label, sql: `
      DROP TABLE IF EXISTS layer_mgt.layer_review CASCADE;
      CREATE TABLE layer_mgt.layer_review (
        id UUID DEFAULT uuid_generate_v1(),
        layer_id UUID,
        example_filename TEXT,
        example_filesize TEXT,
        example_num_recs INTEGER,
        example_num_cols INTEGER,
        documentation_requirements TEXT,
        application_goal TEXT,
        data_elements TEXT,
        geom_type TEXT, -- raster/vector multipolygon etc.
        source_crs TEXT,
        cost_estimates TEXT, -- state if N/A
        jira_review TEXT,
        need_determination BOOLEAN,
        
        PRIMARY KEY (id),
        FOREIGN KEY (layer_id)
          REFERENCES layer_mgt.layer (id)
      );
  `
}
