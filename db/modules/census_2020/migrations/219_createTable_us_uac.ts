import {createLayerTable} from "../../../sql/migrate.js";
import {LayerTableOptions} from "../../../../types/migrate.js";

const seq = 219;

const options: LayerTableOptions = {
  load: false,
  schema: 'census_2020',
  tableName: 'us_uac',
  layerName: 'UAC',
  layerDesc: '2010 Urban Area/Urban Cluster',
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
      gid        INTEGER NOT NULL,
      uace10     CHARACTER VARYING(5),
      geoid10    CHARACTER VARYING(5),
      name10     CHARACTER VARYING(100),
      namelsad10 CHARACTER VARYING(100),
      lsad10     CHARACTER VARYING(2),
      mtfcc10    CHARACTER VARYING(5),
      uatyp10    CHARACTER VARYING(1),
      funcstat10 CHARACTER VARYING(1),
      aland10    DOUBLE PRECISION,
      awater10   DOUBLE PRECISION,
      intptlat10 CHARACTER VARYING(11),
      intptlon10 CHARACTER VARYING(12),
      shape      geometry,
`;

export default createLayerTable(options, columns, seq);
