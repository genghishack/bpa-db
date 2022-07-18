import {createLayerTable} from "../../migrateSQL.js";
import {LayerTableOptions} from "../../../types/migrate.js";

const seq = 213;

const options: LayerTableOptions = {
  load: false,
  schema: 'census_2020',
  tableName: 'us_ttract',
  layerName: 'TTRACT',
  layerDesc: 'Tribal Census Tract',
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
      ttractce      CHARACTER VARYING(6), 
      geoid         CHARACTER VARYING(10), 
      NAME          CHARACTER VARYING(7), 
      namelsad      CHARACTER VARYING(27), 
      mtfcc         CHARACTER VARYING(5), 
      aland         DOUBLE PRECISION, 
      awater        DOUBLE PRECISION, 
      intptlat      CHARACTER VARYING(11), 
      intptlon      CHARACTER VARYING(12), 
      shape         geometry, 
`;

export default createLayerTable(options, columns, seq);
