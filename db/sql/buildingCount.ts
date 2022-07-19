import {pgQuery} from "../../lib/postgres.js";

export const createBldgCountTable = async () => {
  const {schema, layer} = layerOpts;
  log.info(`Creating ${schema.data}.${layer.table}_building_count_by_census_block table`);
  const label = `create ${schema.data}.${layer.table}_building_count_by_census_block table`;
  const tableName = `${layer.table}_building_count_by_census_block`;
  const sql = `
      DROP TABLE IF EXISTS ${schema.data}.${tableName};
      CREATE TABLE ${schema.data}.${tableName}
      (
          LIKE ${schema.base}.building_count_by_census_block INCLUDING ALL
      ) INHERITS ( ${schema.base}.building_count_by_census_block );
      CREATE INDEX idx_tabblock_id_${tableName} ON ${schema.data}.${tableName} (tabblock_id);
  `;
  return pgQuery(sql, [], label);
}

export const createBldgCountView = async () => {
  const {schema, state, layer} = layerOpts;
  log.info(`Creating ${schema.data}.v_${layer.table}_building_count_by_census_block view`);
  const label = `create ${schema.data}.v_${layer.table}_building_count_by_census_block view`;
  const sql = `
    DROP VIEW IF EXISTS ${schema.data}.v_${layer.table}_building_count_by_census_block;
    CREATE VIEW ${schema.data}.v_${layer.table}_building_count_by_census_block AS
      SELECT * FROM ${schema.data}.mv_${layer.table}_building_count_by_census_block WHERE statefp = '${state.fips}';
  `;
  return pgQuery(sql, [], label);
}

export const updateChildCountTable = async () => {
  const {schema, layer} = layerOpts;
  log.info('updating child count table');
  const label = 'update child count table';
  const sql = `
    TRUNCATE TABLE ${schema.data}.${layer.table}_building_count_by_census_block;
    INSERT INTO ${schema.data}.${layer.table}_building_count_by_census_block
      SELECT * FROM ${schema.data}.v_${layer.table}_building_count_by_census_block;
  `;
  return pgQuery(sql, [], label, true);
}

export const refreshBCBCBMView = async () => {
  const {schema, state} = layerOpts;
  log.info(`refreshing materialized view ${schema.data}.mv_${state.abbrev}_parcel_bcbcb`);
  const label = `refresh materialized view ${schema.data}.mv_${state.abbrev}_parcel_bcbcb`;
  const sql = `
    REFRESH MATERIALIZED VIEW ${schema.data}.mv_${state.abbrev}_parcel_bcbcb;
  `
  return pgQuery(sql, [], label, true);
}

export const createBCBCBMView = async () => {
  const {schema, layer, state} = layerOpts;
  const tableName = `mv_${state.abbrev}_parcel_bcbcb`;
  const fullTableName = `${schema.data}.${tableName}`
  log.info(`Creating ${schema.data}.${tableName} materialized view`);
  const label = `create ${schema.data}.${tableName} mview`;
  const sql = `
      DROP MATERIALIZED VIEW IF EXISTS ${fullTableName} CASCADE;
      CREATE MATERIALIZED VIEW ${fullTableName} AS
        SELECT * FROM ${schema.data}.${state.abbrev}_parcel_building_count_by_census_block;
      CREATE INDEX idx_tabblock_id_${tableName} ON ${fullTableName} (tabblock_id);
  `;
  return pgQuery(sql, [], label, true);
}

export const createBldgCountMView = async () => {
  const {schema, state, layer} = layerOpts;
  log.info(`Creating ${schema.data}.mv_${layer.table}_building_count_by_census_block materialized view`);
  const label = `create ${schema.data}.mv_${layer.table}_building_count_by_census_block mview`;
  const sql = `
    DROP MATERIALIZED VIEW IF EXISTS ${schema.data}.mv_${layer.table}_building_count_by_census_block CASCADE;
    CREATE MATERIALIZED VIEW ${schema.data}.mv_${layer.table}_building_count_by_census_block AS
      SELECT 
        c.statefp,
        c.countyfp20,
        c.tractce20,
        c.blockce20,
        c.tabblock_id,
        count(g.id) AS structure_count
      FROM ${schema.data}.geom_${layer.table} g
      LEFT JOIN census_2020_data.${state.abbrev}_tabblock20 c ON st_coveredby(g.shape_ctrpt, c.shape) = true
      GROUP BY 
        c.statefp,
        c.countyfp20,
        c.tractce20,
        c.blockce20,
        c.tabblock_id;
  `;
  return pgQuery(sql, [], label);
}

export const refreshBldgCountMView = async () => {
  const {schema, layer} = layerOpts;
  log.info('refreshing materialized view');
  const label = 'refresh materialized view';
  const sql = `
    REFRESH MATERIALIZED VIEW ${schema.data}.mv_${layer.table}_building_count_by_census_block;
  `
  return pgQuery(sql, [], label, true);
}

export const createBldgCountByCommunityMView = async () => {
  const {schema, layer} = layerOpts;
  const parentTableName = 'bc_community';
  const tableName = `${layer.table}_${parentTableName}`;
  const mviewName = `mv_${tableName}`;
  const geomTableName = `geom_${layer.table}`;

  log.info(`Creating ${schema.data}.${mviewName} materialized view`);
  const label = `create ${schema.data}.${mviewName} mview`;
  const sql = `
    DROP MATERIALIZED VIEW IF EXISTS ${schema.data}.${mviewName} CASCADE;
    CREATE MATERIALIZED VIEW ${schema.data}.${mviewName} AS
      SELECT
        c.objectid,
        c.cis_cid,
        c.cis_cid_partic,
        c.state_fips AS statefp,
        c.county_fips AS countyfp,
        c.census_geoid,
        c.cis_community_name_full,
        count(g.id) AS structure_count
      FROM ${schema.data}.${geomTableName} g
      LEFT JOIN community.cl2020v4_2d_community_layer_202012 c ON st_coveredby(g.centroid, c.shape) = true
      GROUP BY
        c.objectid,
        c.cis_cid,
        c.cis_cid_partic,
        c.state_fips,
        c.county_fips,
        c.census_geoid,
        c.cis_community_name_full;
  `;
  return pgQuery(sql, [], label, true);
}

export const createBldgCountByCensusBlockMView = async () => {
  const {schema, state, layer} = layerOpts;
  const parentTableName = 'bc_census_block';
  const tableName = `${layer.table}_${parentTableName}`;
  const mviewName = `mv_${tableName}`;
  const geomTableName = `geom_${layer.table}`;

  log.info(`Creating ${schema.data}.${mviewName} materialized view`);
  const label = `create ${schema.data}.${mviewName} mview`;
  const sql = `
    DROP MATERIALIZED VIEW IF EXISTS ${schema.data}.${mviewName} CASCADE;
    CREATE MATERIALIZED VIEW ${schema.data}.${mviewName} AS
      SELECT
        c.tabblock_id,
        c.statefp,
        c.countyfp20 AS countyfp,
        c.tractce20 AS tractce,
        c.blockce20 AS blockce,
        count(g.id) AS structure_count
      FROM ${schema.data}.${geomTableName} g
      LEFT JOIN census_2020_data.${state.abbrev}_tabblock20 c ON st_coveredby(g.centroid, c.shape) = true
      GROUP BY
        c.tabblock_id,
        c.statefp,
        c.countyfp20,
        c.tractce20,
        c.blockce20;
    CREATE INDEX idk_tabblock_id_${mviewName} ON ${schema.data}.${mviewName}(tabblock_id);
  `;
  return pgQuery(sql, [], label);
}

export const createBldgCountByCountyMView = async () => {
  const {schema, layer} = layerOpts;
  const cbBaseTableName = 'bc_census_block';
  const cbTableName = `${layer.table}_${cbBaseTableName}`;
  const countyBaseTableName = 'bc_county';
  const countyTableName = `${layer.table}_${countyBaseTableName}`;
  const mviewName = `mv_${countyTableName}`;

  log.info(`Creating ${schema.data}.${mviewName} materialized view`);
  const label = `create ${schema.data}.${mviewName} mview`;
  const sql = `
    DROP MATERIALIZED VIEW IF EXISTS ${schema.data}.${mviewName} CASCADE;
    CREATE MATERIALIZED VIEW ${schema.data}.${mviewName} AS
      SELECT 
        countyfp, 
        statefp,
        SUM (structure_count) AS structure_count
      FROM ${schema.data}.mv_${cbTableName}
      WHERE countyfp IS NOT NULL
      GROUP BY countyfp, statefp;
    CREATE INDEX idk_tabblock_id_${mviewName} ON ${schema.data}.${mviewName}(countyfp);
  `;
  return pgQuery(sql, [], label, true);
}

export const createBldgCountByStateMView = async () => {
  const {schema, layer} = layerOpts;
  const cbBaseTableName = 'bc_census_block';
  const cbTableName = `${layer.table}_${cbBaseTableName}`;
  const stateBaseTableName = 'bc_state';
  const stateTableName = `${layer.table}_${stateBaseTableName}`;
  const mviewName = `mv_${stateTableName}`;

  log.info(`Creating ${schema.data}.${mviewName} materialized view`);
  const label = `create ${schema.data}.${mviewName} mview`;
  const sql = `
    DROP MATERIALIZED VIEW IF EXISTS ${schema.data}.${mviewName} CASCADE;
    CREATE MATERIALIZED VIEW ${schema.data}.${mviewName} AS
      SELECT 
        statefp,
        SUM (structure_count) AS structure_count
      FROM ${schema.data}.mv_${cbTableName}
      WHERE statefp IS NOT NULL
      GROUP BY statefp;
    CREATE INDEX idk_tabblock_id_${mviewName} ON ${schema.data}.${mviewName}(statefp);
  `;
  return pgQuery(sql, [], label, true);
}

