import {createLayerTable} from "../../migrateSQL.js";
import {LayerTableOptions} from "../../../types/migrate.js";

const seq = 212;

const options: LayerTableOptions = {
  load: false,
  schema: 'nfhl',
  tableName: 'flood_hazard_zones_esri',
  layerName: 'flood_hazard_zones_esri',
  layerDesc: 'Flood Hazard Zones',
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
        objectid         INTEGER, 
        dfirm_id         CHARACTER VARYING(6), 
        version_id       CHARACTER VARYING(11), 
        fld_ar_id        CHARACTER VARYING(32), 
        study_typ        CHARACTER VARYING(28), 
        fld_zone         CHARACTER VARYING(17), 
        zone_subty       CHARACTER VARYING(72), 
        sfha_tf          CHARACTER VARYING(1), 
        static_bfe       DOUBLE PRECISION, 
        v_datum          CHARACTER VARYING(17), 
        depth            DOUBLE PRECISION, 
        len_unit         CHARACTER VARYING(16), 
        velocity         DOUBLE PRECISION, 
        vel_unit         CHARACTER VARYING(20), 
        ar_revert        CHARACTER VARYING(17), 
        ar_subtrv        CHARACTER VARYING(57), 
        bfe_revert       DOUBLE PRECISION, 
        dep_revert       DOUBLE PRECISION, 
        dual_zone        CHARACTER VARYING(1), 
        source_cit       CHARACTER VARYING(21), 
        gfid             CHARACTER VARYING(36), 
        shape_stlength__ DOUBLE PRECISION, 
        shape_starea__   DOUBLE PRECISION, 
        shape            geometry, 
`;

export default createLayerTable(options, columns, seq);
