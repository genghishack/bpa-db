import {createLayerTable} from "../../migrateSQL.js";
import {LayerTableOptions} from "../../../types/migrate.js";

const seq = 212;

const options: LayerTableOptions = {
  load: false,
  schema: 'census_2019',
  tableName: 'us_aiannh',
  layerName: 'AIANNH',
  layerDesc: 'American Indian / Alaska Native / Native Hawaiian Areas',
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
      aiannhce      CHARACTER VARYING(4), 
      aiannhns      CHARACTER VARYING(8), 
      geoid         CHARACTER VARYING(5), 
      NAME          CHARACTER VARYING(100), 
      namelsad      CHARACTER VARYING(100), 
      lsad          CHARACTER VARYING(2), 
      classfp       CHARACTER VARYING(2), 
      comptyp       CHARACTER VARYING(1), 
      aiannhr       CHARACTER VARYING(1), 
      mtfcc         CHARACTER VARYING(5), 
      funcstat      CHARACTER VARYING(1), 
      aland         DOUBLE PRECISION, 
      awater        DOUBLE PRECISION, 
      intptlat      CHARACTER VARYING(11), 
      intptlon      CHARACTER VARYING(12), 
      shape         geometry, 
`;

export default createLayerTable(options, columns, seq);
