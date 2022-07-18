import {createLayerTable} from "../../migrateSQL.js";
import {LayerTableOptions} from "../../../types/migrate.js";

const seq = 312;

const options: LayerTableOptions = {
  load: false,
  schema: 'noaa',
  tableName: 'storm_outlook_current',
  layerName: 'storm_outlook_current',
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
        ogc_fid   INTEGER,
        gml_id    CHARACTER VARYING NOT NULL,
        advdate   CHARACTER VARYING(27),
        advisnum  CHARACTER VARYING(5),
        basin     CHARACTER VARYING(5),
        datelbl   CHARACTER VARYING(12),
        dvlbl     CHARACTER VARYING(5),
        fcstprd   INTEGER,
        fldatelbl CHARACTER VARYING(50),
        gust      INTEGER,
        lat DOUBLE PRECISION,
        lon DOUBLE PRECISION,
        maxwind              INTEGER,
        mslp                 INTEGER,
        ssnum                INTEGER,
        stormname            CHARACTER VARYING(100),
        stormnum             INTEGER,
        stormsrc             CHARACTER VARYING(50),
        stormtype            CHARACTER VARYING(5),
        tcdvlp               CHARACTER VARYING(25),
        tau                  INTEGER,
        tcdir                INTEGER,
        tcspd                INTEGER,
        timezone             CHARACTER VARYING(3),
        validtime            CHARACTER VARYING(7),
        idp_source           CHARACTER VARYING(50),
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
