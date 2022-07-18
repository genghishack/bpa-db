import {createLayerTable} from "../../migrateSQL.js";
import {LayerTableOptions} from "../../../types/migrate.js";

const seq = 113;

const options: LayerTableOptions = {
  load: true,
  schema: 'noaa',
  tableName: 'nws_flood_outlook',
  layerName: 'nws_flood_outlook',
  layerDesc: 'Flood Outlook',
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
        objectid   INTEGER, 
        identifier TEXT, 
        valid_time CHARACTER VARYING(40), 
        outlook    CHARACTER VARYING(40), 
        issue_time CHARACTER VARYING(19), 
        start_time CHARACTER VARYING(19), 
        end_time   CHARACTER VARYING(19), 
        shape      geometry, 
        st_area_shape_       DOUBLE PRECISION, 
        st_length_shape_     DOUBLE PRECISION, 
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
        UNIQUE (objectid),
`;

export default createLayerTable(options, columns, seq);
