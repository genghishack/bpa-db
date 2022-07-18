const sequence = 1.101;

export default {
  seq: sequence,
  label: 'set search path',
  sql: `
    ALTER DATABASE ${process.env.PGDATABASE}
      SET search_path = "$user", public, extensions, tiger, topology, layer_mgt;
  `
};
