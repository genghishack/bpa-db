import {createLayerTable} from "../../migrateSQL.js";
import {LayerTableOptions} from "../../../types/migrate.js";

const seq = 118;

const options: LayerTableOptions = {
  load: true,
  schema: 'census_2020',
  tableName: 'tabblock',
  layerName: 'TABBLOCK',
  layerDesc: '2010 Tabulation (Census) Block',
  pk: 'id',
  uidx: ['tabblock_id'],
  level: {
    county: false,
    state: true,
    nation: false,
  },
  columns_exclude: [],
  geom: {
    field: 'shape',
    dims: 2,
    srid: 4326,
    type: 'multipolygon',
  }
}

const columns = `
      gid           INTEGER NOT NULL,
      statefp       CHARACTER VARYING(2),
      countyfp10    CHARACTER VARYING(3),
      tractce10     CHARACTER VARYING(6),
      blockce10     CHARACTER VARYING(4),
      tabblock_id   CHARACTER VARYING(16) NOT NULL,
      name10        CHARACTER VARYING(20),
      mtfcc10       CHARACTER VARYING(5),
      ur10          CHARACTER VARYING(1),
      uace10        CHARACTER VARYING(5),
      uatype        CHARACTER VARYING(1),
      funcstat10    CHARACTER VARYING(1),
      aland10       DOUBLE PRECISION,
      awater10      DOUBLE PRECISION,
      intptlat10    CHARACTER VARYING(11),
      intptlon10    CHARACTER VARYING(12),
      shape         geometry,
`;

export default createLayerTable(options, columns, seq);
