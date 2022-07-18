import {createLayerTable} from "../../migrateSQL.js";
import {LayerTableOptions} from "../../../types/migrate.js";

const seq = 110;

const options: LayerTableOptions = {
  load: true,
  schema: 'census_2021',
  tableName: 'bg',
  layerName: 'BG',
  layerDesc: 'Block Group',
  pk: 'id',
  uidx: ['bg_id'],
  level: {
    county: false,
    state: true,
    nation: false,
  },
  columns_exclude: [],
  geom: {
    field: 'shape',
    srid: 4326,
    dims: 2,
    type: 'multipolygon',
  }
}

const columns = `
      gid           INTEGER NOT NULL,
      statefp       CHARACTER VARYING(2),
      countyfp      CHARACTER VARYING(3),
      tractce       CHARACTER VARYING(6),
      blkgrpce      CHARACTER VARYING(1),
      bg_id         CHARACTER VARYING(12) NOT NULL,
      namelsad      CHARACTER VARYING(13),
      mtfcc         CHARACTER VARYING(5),
      funcstat      CHARACTER VARYING(1),
      aland         DOUBLE PRECISION,
      awater        DOUBLE PRECISION,
      intptlat      CHARACTER VARYING(11),
      intptlon      CHARACTER VARYING(12),
      shape         geometry,
`;

export default createLayerTable(options, columns, seq);
