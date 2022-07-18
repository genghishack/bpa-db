import {createLayerTable} from "../../migrateSQL.js";
import {LayerTableOptions} from "../../../types/migrate.js";

const seq = 211;

const options: LayerTableOptions = {
  load: true,
  schema: 'census_2019',
  tableName: 'us_county',
  layerName: 'COUNTY',
  layerDesc: 'County',
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
      countyfp      CHARACTER VARYING(3), 
      countyns      CHARACTER VARYING(8), 
      geoid         CHARACTER VARYING(5), 
      NAME          CHARACTER VARYING(100), 
      namelsad      CHARACTER VARYING(100), 
      lsad          CHARACTER VARYING(2), 
      classfp       CHARACTER VARYING(2), 
      mtfcc         CHARACTER VARYING(5), 
      csafp         CHARACTER VARYING(3), 
      cbsafp        CHARACTER VARYING(5), 
      metdivfp      CHARACTER VARYING(5), 
      funcstat      CHARACTER VARYING(1), 
      aland         DOUBLE PRECISION, 
      awater        DOUBLE PRECISION, 
      intptlat      CHARACTER VARYING(11), 
      intptlon      CHARACTER VARYING(12), 
      shape         geometry, 
`;

export default createLayerTable(options, columns, seq);
