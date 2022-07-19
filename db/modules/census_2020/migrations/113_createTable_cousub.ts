import {createLayerTable} from "../../../sql/migrate.js";
import {LayerTableOptions} from "../../../../types/migrate.js";

const seq = 113;

const options: LayerTableOptions = {
  load: true,
  schema: 'census_2020',
  tableName: 'cousub',
  layerName: 'COUSUB',
  layerDesc: 'County Subdivision',
  pk: 'id',
  uidx: ['cosbidfp', 'gid'],
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
      cousubfp      CHARACTER VARYING(5),
      cousubns      CHARACTER VARYING(8),
      cosbidfp      CHARACTER VARYING(10) NOT NULL,
      NAME          CHARACTER VARYING(100),
      namelsad      CHARACTER VARYING(100),
      lsad          CHARACTER VARYING(2),
      classfp       CHARACTER VARYING(2),
      mtfcc         CHARACTER VARYING(5),
      cnectafp      CHARACTER VARYING(3),
      nectafp       CHARACTER VARYING(5),
      nctadvfp      CHARACTER VARYING(5),
      funcstat      CHARACTER VARYING(1),
      aland         NUMERIC(14,0),
      awater        NUMERIC(14,0),
      intptlat      CHARACTER VARYING(11),
      intptlon      CHARACTER VARYING(12),
      shape         geometry,
`;

export default createLayerTable(options, columns, seq);
