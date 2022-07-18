import {createLayerTable} from "../../migrateSQL.js";
import {LayerTableOptions} from "../../../types/migrate.js";

const seq = 110;

const options: LayerTableOptions = {
  load: true,
  schema: 'nfhl',
  tableName: 's_firm_pan',
  layerName: 's_firm_pan',
  layerDesc: 'FIRM Panels',
  pk: 'id',
  uidx: [],
  level: {
    county: false,
    state: false,
    nation: true,
  },
  columns_exclude: [],
  // geom: 'none',
  geom: {
    field: 'shape',
    srid: 4326,
    dims: 2,
    type: 'multipolygon',
  }
}

const columns = `
        objectid     INTEGER NOT NULL,
        dfirm_id     CHARACTER VARYING(6),
        version_id   CHARACTER VARYING(11),
        firm_id      CHARACTER VARYING(32),
        st_fips      CHARACTER VARYING(2),
        pcomm        CHARACTER VARYING(4),
        panel        CHARACTER VARYING(4),
        suffix       CHARACTER VARYING(1),
        firm_pan     CHARACTER VARYING(11),
        panel_typ    CHARACTER VARYING(30),
        pre_date     TIMESTAMP(6) WITH TIME ZONE,
        eff_date     TIMESTAMP(6) WITH TIME ZONE,
        SCALE        CHARACTER VARYING(5),
        pnp_reason   CHARACTER VARYING(254),
        base_typ     CHARACTER VARYING(10),
        source_cit   CHARACTER VARYING(21),
        gfid         CHARACTER VARYING(36),
        shape_length DOUBLE PRECISION,
        shape_area   DOUBLE PRECISION,
        shape        geometry,
`;

export default createLayerTable(options, columns, seq);
