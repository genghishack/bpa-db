import {createLayerTable} from "../../migrateSQL.js";
import {LayerTableOptions} from "../../../types/migrate.js";

const seq = 112;

const options: LayerTableOptions = {
  load: true,
  schema: 'noaa',
  tableName: 'nhc_tws_past_points',
  layerName: 'nhc_tws_past_points',
  layerDesc: 'Past Points',
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
        objectid  INTEGER, 
        stormname CHARACTER VARYING(50), 
        dtg       DOUBLE PRECISION, 
        MONTH     CHARACTER VARYING(50), 
        hhmm      CHARACTER VARYING(50), 
        mslp      DOUBLE PRECISION, 
        basin     CHARACTER VARYING(50), 
        stormnum  DOUBLE PRECISION, 
        stormtype CHARACTER VARYING(50), 
        intensity DOUBLE PRECISION, 
        lat       DOUBLE PRECISION, 
        lon       DOUBLE PRECISION, 
        shape     geometry, 
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
        YEAR    DOUBLE PRECISION, 
        DAY     DOUBLE PRECISION, 
        ss      DOUBLE PRECISION, 
        stormid CHARACTER VARYING(50), 
        advnum  CHARACTER VARYING(50), 
        UNIQUE  (objectid),
`;

export default createLayerTable(options, columns, seq);
