import {createLayerTable} from "../../migrateSQL.js";
import {LayerTableOptions} from "../../../types/migrate.js";

const seq = 117;

const options: LayerTableOptions = {
  load: true,
  schema: 'census_2019',
  tableName: 'place',
  layerName: 'PLACE',
  layerDesc: 'Place',
  pk: 'id',
  uidx: ['plcidfp', 'gid'],
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
      gid           SERIAL NOT NULL,
      statefp       CHARACTER VARYING(2),
      placefp       CHARACTER VARYING(5),
      placens       CHARACTER VARYING(8),
      plcidfp       CHARACTER VARYING(7) NOT NULL,
      NAME          CHARACTER VARYING(100),
      namelsad      CHARACTER VARYING(100),
      lsad          CHARACTER VARYING(2),
      classfp       CHARACTER VARYING(2),
      pcicbsa       CHARACTER VARYING(1),
      pcinecta      CHARACTER VARYING(1),
      mtfcc         CHARACTER VARYING(5),
      funcstat      CHARACTER VARYING(1),
      aland         BIGINT,
      awater        BIGINT,
      intptlat      CHARACTER VARYING(11),
      intptlon      CHARACTER VARYING(12),
      shape         geometry,
`;

export default createLayerTable(options, columns, seq);
