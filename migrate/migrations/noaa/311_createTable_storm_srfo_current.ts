import {createLayerTable} from "../../migrateSQL.js";
import {LayerTableOptions} from "../../../types/migrate.js";

const seq = 311;

const options: LayerTableOptions = {
  load: false,
  schema: 'noaa',
  tableName: 'storm_srfo_current',
  layerName: 'storm_srfo_current',
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
        ogc_fid              INTEGER,
        gml_id               CHARACTER VARYING NOT NULL,
        identifier           INTEGER,
        valid_time           CHARACTER VARYING(22),
        outlook              CHARACTER VARYING(21),
        issue_time           CHARACTER VARYING(19),
        start_time           CHARACTER VARYING(19),
        end_time             CHARACTER VARYING(19),
        idp_source           CHARACTER VARYING(3),
        idp_subset           CHARACTER VARYING(7),
        idp_filedate         CHARACTER VARYING(19),
        idp_ingestdate       CHARACTER VARYING(19),
        idp_current_forecast INTEGER,
        idp_time_series      INTEGER,
        idp_issueddate       CHARACTER VARYING,
        idp_validtime        CHARACTER VARYING,
        idp_validendtime     CHARACTER VARYING,
        idp_fcst_hour        INTEGER,
        shape geometry,
`;

export default createLayerTable(options, columns, seq);
