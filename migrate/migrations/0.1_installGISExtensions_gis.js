module.exports = {
  seq: 0.1,
  label: 'install gis extensions',
  sql: `
    CREATE EXTENSION IF NOT EXISTS postgis;
    CREATE EXTENSION IF NOT EXISTS postgis_topology;
    CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
    CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder;
    CREATE EXTENSION IF NOT EXISTS address_standardizer;
    CREATE EXTENSION IF NOT EXISTS address_standardizer_data_us;
  `
};
