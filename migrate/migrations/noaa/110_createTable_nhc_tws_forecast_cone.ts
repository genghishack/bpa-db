import {createLayerTable} from "../../migrateSQL.js";
import {LayerTableOptions} from "../../../types/migrate.js";

const seq = 110;

const options: LayerTableOptions = {
  load: true,
  schema: 'noaa',
  tableName: 'nhc_tws_forecast_cone',
  layerName: 'nhc_tws_forecast_cone',
  layerDesc: 'Forecast Cone',
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
    type: 'multipolygon',
  }
}

const columns = `
  objectid             INTEGER,
  stormname            CHARACTER VARYING(50),
  stormtype            CHARACTER VARYING(50),
  advdate              CHARACTER VARYING(50),
  advisnum             CHARACTER VARYING(50),
  stormnum             DOUBLE PRECISION,
  fcstprd              DOUBLE PRECISION,
  basin                CHARACTER VARYING(50),
  shape                geometry,
  idp_source           CHARACTER VARYING(50),
  idp_subset           CHARACTER VARYING(50),
  idp_filedate         BIGINT,
  idp_ingestdate       BIGINT,
  idp_current_forecast INTEGER,
  idp_time_series      INTEGER,
  idp_issueddate       BIGINT,
  idp_validtime        BIGINT,
  idp_validendtime     BIGINT,
  idp_fcst_hour        INTEGER,
  st_area              DOUBLE PRECISION,
  st_length            DOUBLE PRECISION,
  UNIQUE (objectid),
`;

export default createLayerTable(options, columns, seq);
