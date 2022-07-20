const seq = 100;
const label = 'create app schema';

export default {
  seq, label, sql: `
      DROP SCHEMA IF EXISTS app CASCADE;
      CREATE SCHEMA app;
`
}
