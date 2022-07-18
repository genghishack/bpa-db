import {createLayerTable} from "../../migrateSQL.js";
import {LayerTableOptions} from "../../../types/migrate.js";

const seq = 111;

const options: LayerTableOptions = {
  load: true,
  schema: 'nfhl',
  tableName: 'study_info',
  layerName: 'study_info',
  layerDesc: 'Study Info',
  pk: 'id',
  uidx: [],
  level: {
    county: false,
    state: false,
    nation: true,
  },
  columns_exclude: [],
  geom: 'none',
}

const columns = `
        objectid   INTEGER NOT NULL,
        dfirm_id   CHARACTER VARYING(6),
        version_id CHARACTER VARYING(11),
        std_nfo_id CHARACTER VARYING(32),
        study_pre  CHARACTER VARYING(19),
        study_nm   CHARACTER VARYING(128),
        state_nm   CHARACTER VARYING(24),
        cnty_nm    CHARACTER VARYING(128),
        juris_typ  CHARACTER VARYING(22),
        lg_pan_no  CHARACTER VARYING(4),
        opp_tf     CHARACTER VARYING(1),
        h_datum    CHARACTER VARYING(30),
        v_datum    CHARACTER VARYING(17),
        projection CHARACTER VARYING(75),
        proj_zone  CHARACTER VARYING(5),
        proj_unit  CHARACTER VARYING(18),
        proj_secnd CHARACTER VARYING(75),
        proj_sunit CHARACTER VARYING(18),
        proj_szone CHARACTER VARYING(5),
        landwd_val DOUBLE PRECISION,
        cw_tf      CHARACTER VARYING(1),
        rtroft_tf  CHARACTER VARYING(1),
        meta_nm    CHARACTER VARYING(50),
        fis_nm     CHARACTER VARYING(15),
        logo_nm    CHARACTER VARYING(50),
        indx_effdt TIMESTAMP(6) WITH TIME ZONE,
        dbrev_dt   TIMESTAMP(6) WITH TIME ZONE,
        avg_cfactr DOUBLE PRECISION,
        gfid       CHARACTER VARYING(36),
`;

export default createLayerTable(options, columns, seq);
