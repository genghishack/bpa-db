import {createLayerTable} from "../../migrateSQL.js";
import {LayerTableOptions} from "../../../types/migrate.js";

const seq = 113;

const options: LayerTableOptions = {
  load: true,
  schema: 'census_2021',
  tableName: 'tabblock20',
  layerName: 'TABBLOCK20',
  layerDesc: '2020 Tabulation (Census) Block',
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
      countyfp20    CHARACTER VARYING(3), 
      tractce20     CHARACTER VARYING(6), 
      blockce20     CHARACTER VARYING(4), 
      tabblock_id   CHARACTER VARYING(15) NOT NULL, 
      name20        CHARACTER VARYING(10), 
      mtfcc20       CHARACTER VARYING(5), 
      ur20          CHARACTER VARYING(1), 
      uace20        CHARACTER VARYING(5), 
      uatype20      CHARACTER VARYING(1), 
      funcstat20    CHARACTER VARYING(1), 
      aland20       DOUBLE PRECISION, 
      awater20      DOUBLE PRECISION, 
      intptlat20    CHARACTER VARYING(11), 
      intptlon20    CHARACTER VARYING(12), 
      shape         geometry,
`;

export default createLayerTable(options, columns, seq);
