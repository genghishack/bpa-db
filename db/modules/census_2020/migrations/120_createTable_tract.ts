import {createLayerTable} from "../../../sql/migrate.js";
import {LayerTableOptions} from "../../../../types/migrate.js";

const seq = 120;

const options: LayerTableOptions = {
  load: true,
  schema: 'census_2020',
  tableName: 'tract',
  layerName: 'TRACT',
  layerDesc: 'Census Tract',
  pk: 'id',
  uidx: ['tract_id'],
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
      countyfp      CHARACTER VARYING(3),
      tractce       CHARACTER VARYING(6),
      tract_id      CHARACTER VARYING(11) NOT NULL,
      NAME          CHARACTER VARYING(7),
      namelsad      CHARACTER VARYING(20),
      mtfcc         CHARACTER VARYING(5),
      funcstat      CHARACTER VARYING(1),
      aland         DOUBLE PRECISION,
      awater        DOUBLE PRECISION,
      intptlat      CHARACTER VARYING(11),
      intptlon      CHARACTER VARYING(12),
      shape         geometry,
`;

export default createLayerTable(options, columns, seq);
