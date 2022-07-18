import {createLayerTable} from "../../migrateSQL.js";
import {LayerTableOptions} from "../../../types/migrate.js";

const seq = 313;

const options: LayerTableOptions = {
  load: false,
  schema: 'noaa',
  tableName: 'storm_ero_current',
  layerName: 'storm_ero_current',
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
    type: 'polygon',
  }
}

const columns = `
        ogc_fid    INTEGER,
        gml_id     CHARACTER VARYING NOT NULL,
        identifier INTEGER,
        product    CHARACTER VARYING(43),
        valid_time CHARACTER VARYING(27),
        outlook    CHARACTER VARYING(50),
        issue_time CHARACTER VARYING(19),
        start_time CHARACTER VARYING(19),
        end_time   CHARACTER VARYING(19),
        idp_source CHARACTER VARYING(7),
        idp_subset           CHARACTER VARYING(7),
        idp_filedate         CHARACTER VARYING(19),
        idp_ingestdate       CHARACTER VARYING(19),
        idp_current_forecast INTEGER,
        idp_time_series      INTEGER,
        idp_issueddate       CHARACTER VARYING(19),
        idp_validtime        CHARACTER VARYING(19),
        idp_validendtime     CHARACTER VARYING(19),
        idp_fcst_hour        INTEGER,
        shape geometry,
`;

export default createLayerTable(options, columns, seq);
