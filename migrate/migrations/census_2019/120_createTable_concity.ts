import {createLayerTable} from "../../migrateSQL.js";
import {LayerTableOptions} from "../../../types/migrate.js";

const seq = 120;

const options: LayerTableOptions = {
  load: true,
  schema: 'census_2019',
  tableName: 'concity',
  layerName: 'CONCITY',
  layerDesc: 'Consolidated City',
  pk: 'id',
  uidx: [],
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
      conctyfp      CHARACTER VARYING(5), 
      conctyns      CHARACTER VARYING(8), 
      geoid         CHARACTER VARYING(7), 
      NAME          CHARACTER VARYING(100), 
      namelsad      CHARACTER VARYING(100), 
      lsad          CHARACTER VARYING(2), 
      classfp       CHARACTER VARYING(2), 
      mtfcc         CHARACTER VARYING(5), 
      funcstat      CHARACTER VARYING(1), 
      aland         DOUBLE PRECISION, 
      awater        DOUBLE PRECISION, 
      intptlat      CHARACTER VARYING(11), 
      intptlon      CHARACTER VARYING(12), 
      shape         geometry,
`;

export default createLayerTable(options, columns, seq);
