const seq = 1.301;
const label = 'insert CONUS row into state lookup table';

export default {
  seq, label, sql: `
    INSERT INTO layer_mgt.state (st_code, name, abbrev, statefp)
    VALUES (0, 'Continental United States', 'CUS', '00');
  `
};
