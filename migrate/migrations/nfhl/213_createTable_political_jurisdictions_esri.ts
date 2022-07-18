import {createLayerTable} from "../../migrateSQL.js";
import {LayerTableOptions} from "../../../types/migrate.js";

const seq = 213;

const options: LayerTableOptions = {
  load: false,
  schema: 'nfhl',
  tableName: 'political_jurisdictions_esri',
  layerName: 'political_jurisdictions_esri',
  layerDesc: 'Political Jurisdictions',
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
    type: 'multipolygon'
  }
}

const columns = `
        objectid     INTEGER, 
        dfirm_id     CHARACTER VARYING(6), 
        version_id   CHARACTER VARYING(11), 
        pol_ar_id    CHARACTER VARYING(32), 
        pol_name1    CHARACTER VARYING(50), 
        pol_name2    CHARACTER VARYING(50), 
        pol_name3    CHARACTER VARYING(50), 
        co_fips      CHARACTER VARYING(3), 
        st_fips      CHARACTER VARYING(2), 
        comm_no      CHARACTER VARYING(4), 
        cid          CHARACTER VARYING(6), 
        ani_tf       CHARACTER VARYING(1), 
        ani_firm     CHARACTER VARYING(6), 
        com_nfo_id   CHARACTER VARYING(32), 
        source_cit   CHARACTER VARYING(21), 
        gfid         CHARACTER VARYING(36), 
        shape_length DOUBLE PRECISION, 
        shape_area   DOUBLE PRECISION, 
        shape        geometry, 
`;

export default createLayerTable(options, columns, seq);
