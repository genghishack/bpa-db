const seq = 1.219;
const label = 'create layer_example table';

export default {
  seq, label, sql: `
      DROP TABLE IF EXISTS layer_mgt.layer_example CASCADE;
      CREATE TABLE layer_mgt.layer_example (
        id UUID DEFAULT uuid_generate_v1(),
        layer_review_id UUID,
        example_url TEXT,

        PRIMARY KEY (id),
        FOREIGN KEY (layer_review_id)
          REFERENCES layer_mgt.layer_review (id)
      );
  `
}
