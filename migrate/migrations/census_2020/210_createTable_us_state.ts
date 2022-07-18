import {createLayerTable} from "../../migrateSQL.js";
import {LayerTableOptions} from "../../../types/migrate.js";

const seq = 210;

const options: LayerTableOptions = {
  load: true,
  schema: 'census_2020',
  tableName: 'us_state',
  layerName: 'STATE',
  layerDesc: 'State and Equivalent',
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
      gid INTEGER NOT NULL,
      statefp       CHARACTER VARYING(2),
      region        CHARACTER VARYING(2),
      division      CHARACTER VARYING(2),
      statens       CHARACTER VARYING(8),
      geoid         CHARACTER VARYING(2),
      stusps        CHARACTER VARYING(2),
      NAME          CHARACTER VARYING(100),
      lsad          CHARACTER VARYING(2),
      mtfcc         CHARACTER VARYING(5),
      funcstat      CHARACTER VARYING(1),
      aland         DOUBLE PRECISION,
      awater        DOUBLE PRECISION,
      intptlat      CHARACTER VARYING(11),
      intptlon      CHARACTER VARYING(12),
      shape         geometry,
`;

export default createLayerTable(options, columns, seq);
