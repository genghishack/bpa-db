import {createLayerTable} from "../../migrateSQL.js";
import {LayerTableOptions} from "../../../types/migrate.js";

const seq = 215;

const options: LayerTableOptions = {
  load: false,
  schema: 'census_2019',
  tableName: 'us_cd',
  layerName: 'CD',
  layerDesc: '116th Congressional District',
  pk: 'id',
  uidx: [],
  level: {
    county: false,
    state: false,
    nation: true,
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
      cd116fp       CHARACTER VARYING(2), 
      geoid         CHARACTER VARYING(4), 
      namelsad      CHARACTER VARYING(41), 
      lsad          CHARACTER VARYING(2), 
      cdsessn       CHARACTER VARYING(3), 
      mtfcc         CHARACTER VARYING(5), 
      funcstat      CHARACTER VARYING(1), 
      aland         DOUBLE PRECISION, 
      awater        DOUBLE PRECISION, 
      intptlat      CHARACTER VARYING(11), 
      intptlon      CHARACTER VARYING(12), 
      shape         geometry,
`;

export default createLayerTable(options, columns, seq);
