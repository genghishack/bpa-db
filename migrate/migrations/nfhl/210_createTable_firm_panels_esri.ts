import {createLayerTable} from "../../migrateSQL.js";
import {LayerTableOptions} from "../../../types/migrate.js";

const seq = 210;

const options: LayerTableOptions = {
  load: false,
  schema: 'nfhl',
  tableName: 'firm_panels_esri',
  layerName: 'firm_panels_esri',
  layerDesc: 'FIRM Panels',
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
        dfirm_id   CHARACTER VARYING(6), 
        version_id CHARACTER VARYING(11), 
        firm_id    CHARACTER VARYING(32), 
        st_fips    CHARACTER VARYING(2), 
        pcomm      CHARACTER VARYING(4), 
        panel      CHARACTER VARYING(4), 
        suffix     CHARACTER VARYING(1), 
        firm_pan   CHARACTER VARYING(11), 
        panel_typ  CHARACTER VARYING(30), 
        pre_date   BIGINT, 
        eff_date   BIGINT, 
        SCALE      CHARACTER VARYING(5), 
        pnp_reason CHARACTER VARYING(254), 
        base_typ   CHARACTER VARYING(10), 
        source_cit CHARACTER VARYING(21), 
        gfid       CHARACTER VARYING(36), 
        shape_stlength__ DOUBLE PRECISION, 
        shape_starea__   DOUBLE PRECISION, 
        shape            geometry, 
`;

export default createLayerTable(options, columns, seq);
