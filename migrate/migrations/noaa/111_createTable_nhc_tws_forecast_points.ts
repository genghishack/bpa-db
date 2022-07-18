import {createLayerTable} from "../../migrateSQL.js";
import {LayerTableOptions} from "../../../types/migrate.js";

const seq = 111;

const options: LayerTableOptions = {
  load: true,
  schema: 'noaa',
  tableName: 'nhc_tws_forecast_points',
  layerName: 'nhc_tws_forecast_points',
  layerDesc: 'Forecast Points',
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
        objectid  INTEGER, 
        advdate   CHARACTER VARYING(50), 
        advisnum  CHARACTER VARYING(50), 
        basin     CHARACTER VARYING(50), 
        datelbl   CHARACTER VARYING(50), 
        dvlbl     CHARACTER VARYING(50), 
        fcstprd   DOUBLE PRECISION, 
        fldatelbl CHARACTER VARYING(50), 
        gust      DOUBLE PRECISION, 
        lat       DOUBLE PRECISION, 
        lon       DOUBLE PRECISION, 
        maxwind   DOUBLE PRECISION, 
        mslp      DOUBLE PRECISION, 
        ssnum     DOUBLE PRECISION, 
        stormname CHARACTER VARYING(50), 
        stormnum  DOUBLE PRECISION, 
        stormsrc  CHARACTER VARYING(50), 
        stormtype CHARACTER VARYING(50), 
        tcdvlp    CHARACTER VARYING(50), 
        tau       DOUBLE PRECISION, 
        tcdir     DOUBLE PRECISION, 
        tcspd     DOUBLE PRECISION, 
        timezone             CHARACTER VARYING(50), 
        validtime            CHARACTER VARYING(50), 
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
        shape  geometry, 
        UNIQUE (objectid),
`;

export default createLayerTable(options, columns, seq);
