import {createLayerTable} from "../../migrateSQL.js";
import {LayerTableOptions} from "../../../types/migrate.js";

const seq = 114;

const options: LayerTableOptions = {
  load: true,
  schema: 'noaa',
  tableName: 'nws_excessive_rainfall',
  layerName: 'nws_excessive_rainfall',
  layerDesc: 'Excessive Rainfall',
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
    type: ['polygon', 'multipolygon'],
  }
}

const columns = `
        objectid             INTEGER, 
        identifier           TEXT, 
        product              CHARACTER VARYING(50), 
        valid_time           CHARACTER VARYING(30), 
        outlook              CHARACTER VARYING(20), 
        issue_time           CHARACTER VARYING(19), 
        start_time           CHARACTER VARYING(19), 
        end_time             CHARACTER VARYING(19), 
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
        shape                geometry, 
        st_area_shape_       DOUBLE PRECISION, 
        st_length_shape_     DOUBLE PRECISION, 
        UNIQUE               (objectid),
`;

export default createLayerTable(options, columns, seq);
