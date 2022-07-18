import {createLayerTable} from "../../migrateSQL.js";
import {LayerTableOptions} from "../../../types/migrate.js";

const seq = 211;

const options: LayerTableOptions = {
  load: true,
  schema: 'noaa',
  tableName: 'nws_ahps_qpe',
  layerName: 'nws_ahps_qpe',
  layerDesc: 'Quantitative Precipitation Estimates (QPE)',
  pk: 'id',
  uidx: [],
  level: {
    county: false,
    state: false,
    nation: true,
  },
  columns_exclude: [],
  geom: 'none',
}

const columns = `
  rid INTEGER NOT NULL,
  rast raster,
  filename TEXT,
`;

export default createLayerTable(options, columns, seq);
