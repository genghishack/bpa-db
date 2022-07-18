import {createLayerTable} from "../../migrateSQL.js";
import {LayerTableOptions} from "../../../types/migrate.js";

const seq = 116;

const options: LayerTableOptions = {
  load: true,
  schema: 'noaa',
  tableName: 'nws_river_stages',
  layerName: 'nws_river_stages',
  layerDesc: 'River Stages',
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
    type: 'point'
  }
}
const columns = `
        objectid INTEGER, 
        gaugelid CHARACTER VARYING(5), 
        status   CHARACTER VARYING(25), 
        LOCATION CHARACTER VARYING(90), 
        latitude DOUBLE PRECISION, 
        longitude DOUBLE PRECISION, 
        waterbody            CHARACTER VARYING(255), 
        state                CHARACTER VARYING(2), 
        obstime              CHARACTER VARYING(26), 
        units                CHARACTER VARYING(5), 
        lowthreshu           CHARACTER VARYING(5), 
        wfo                  CHARACTER VARYING(5), 
        hdatum               CHARACTER VARYING(30), 
        pedts                CHARACTER VARYING(5), 
        secunit              CHARACTER VARYING(5), 
        url                  CHARACTER VARYING(231), 
        idp_source           CHARACTER VARYING(50), 
        idp_subset           CHARACTER VARYING(50), 
        observed             CHARACTER VARYING(24), 
        action               CHARACTER VARYING(24), 
        forecast             CHARACTER VARYING(24), 
        lowthresh            CHARACTER VARYING(24), 
        secvalue             CHARACTER VARYING(24), 
        flood                CHARACTER VARYING(24), 
        moderate             CHARACTER VARYING(24), 
        major                CHARACTER VARYING(24), 
        idp_filedate         BIGINT, 
        idp_ingestdate       BIGINT, 
        idp_current_forecast INTEGER, 
        idp_time_series      INTEGER, 
        idp_issueddate       BIGINT, 
        idp_validtime        BIGINT, 
        idp_validendtime     BIGINT, 
        idp_fcst_hour        INTEGER, 
        shape geometry, 
`;

export default createLayerTable(options, columns, seq);
