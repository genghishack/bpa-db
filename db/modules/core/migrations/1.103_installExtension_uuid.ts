const sequence = 1.103;

export default {
  seq: sequence,
  label: 'install uuid extension',
  sql: `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  `
};
