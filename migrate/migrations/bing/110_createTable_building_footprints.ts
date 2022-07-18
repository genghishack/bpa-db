import {createLayerTable} from "../../migrateSQL.js";
import {LayerTableOptions} from "../../../types/migrate.js";

const seq = 110;

const options: LayerTableOptions = {
  load: true,
  schema: 'bing',
  tableName: 'building_footprints',
  layerName: 'building_footprints',
  layerDesc: 'Bing Building Footprints',
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
    srid: 4326,
    dims: 2,
    type: 'multipolygon',
  }
}

const columns = `
        ogc_fid             INTEGER NOT NULL, 
        RELEASE             INTEGER, 
        capture_dates_range CHARACTER VARYING, 
        shape               geometry, 
`;

export default createLayerTable(options, columns, seq);
