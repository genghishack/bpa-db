import {createLayerTable} from "../../migrateSQL.js";
import {LayerTableOptions} from "../../../types/migrate.js";

const seq = 210;

const options: LayerTableOptions = {
  load: true,
  schema: 'noaa',
  tableName: 'hurdat2',
  layerName: 'hurdat2',
  layerDesc: 'HURDAT2',
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
    srid: 4326,
    dims: 2,
    type: 'point',
  }
}

const columns = `
        storm_id    CHARACTER VARYING(8),
        storm_name  CHARACTER VARYING(15),
        storm_basin CHARACTER VARYING(2),
        cyclone_num CHARACTER VARYING(2),
        storm_year  CHARACTER VARYING(4),
        
        meas_ymd    CHARACTER VARYING(8),
        meas_hm     CHARACTER VARYING(4),
        meas_year   CHARACTER VARYING(4),
        meas_month  CHARACTER VARYING(2),
        meas_day    CHARACTER VARYING(2),
        meas_hour   CHARACTER VARYING(2),
        meas_minute CHARACTER VARYING(2),

        rec_identifier CHARACTER VARYING(1),
        storm_status CHARACTER VARYING(2),

        lat REAL,
        lng REAL,

        msw_kt INTEGER,
        mcb_mb INTEGER,

        ne_34 INTEGER,
        se_34 INTEGER,
        sw_34 INTEGER,
        nw_34 INTEGER,
        ne_50 INTEGER,
        se_50 INTEGER,
        sw_50 INTEGER,
        nw_50 INTEGER,
        ne_64 INTEGER,
        se_64 INTEGER,
        sw_64 INTEGER,
        nw_64 INTEGER,

        shape_wkt TEXT,
        shape geometry,
`;

export default createLayerTable(options, columns, seq);
