import {createLayerTable} from "../../migrateSQL.js";
import {LayerTableOptions} from "../../../types/migrate.js";

const seq = 217;

const options: LayerTableOptions = {
  load: false,
  schema: 'census_2020',
  tableName: 'us_csa',
  layerName: 'CSA',
  layerDesc: 'Combined Statistical Area',
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
      gid      INTEGER NOT NULL,
      csafp    CHARACTER VARYING(3),
      geoid    CHARACTER VARYING(3),
      NAME     CHARACTER VARYING(100),
      namelsad CHARACTER VARYING(100),
      lsad     CHARACTER VARYING(2),
      mtfcc    CHARACTER VARYING(5),
      aland    DOUBLE PRECISION,
      awater   DOUBLE PRECISION,
      intptlat CHARACTER VARYING(11),
      intptlon CHARACTER VARYING(12),
      shape    geometry,
`;

export default createLayerTable(options, columns, seq);
