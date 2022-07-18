import {createLayerTable} from "../../migrateSQL.js";
import {LayerTableOptions} from "../../../types/migrate.js";

const seq = 310;

const options: LayerTableOptions = {
  load: false,
  schema: 'noaa',
  tableName: 'storm_ahps_current',
  layerName: 'storm_ahps_current',
  layerDesc: 'Full Forecast Period River Stages',
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
  ogc_fid       INTEGER           NOT NULL,
  gml_id        CHARACTER VARYING NOT NULL,
  gaugelid      CHARACTER VARYING(5),
  status        CHARACTER VARYING(16),
  waterbody     CHARACTER VARYING(45),
  state         CHARACTER VARYING(2),
  url           CHARACTER VARYING(67),
  idp_filedate  CHARACTER VARYING(19),
  shape         geometry,
`;

export default createLayerTable(options, columns, seq);
