import {createLayerTable} from "../../migrateSQL.js";
import {LayerTableOptions} from "../../../types/migrate.js";

const seq = 112;

const options: LayerTableOptions = {
  load: true,
  schema: 'ornl',
  tableName: 'structures_raw',
  layerName: 'structures_raw',
  layerDesc: 'Structures (Raw)',
  pk: 'id',
  uidx: ['objectid'],
  level: {
    county: false,
    state: true,
    nation: false,
  },
  columns_exclude: ['id','pluscode','statefp','shape_invalid','false_positive','derived_lng','derived_lat'],
  geom: 'none'
}

const columns = `
      pluscode       CHARACTER VARYING(20),
      statefp        CHARACTER VARYING(2),
      objectid       INTEGER NOT NULL,
      build_id       INTEGER,
      occ_cls        CHARACTER VARYING(20),
      prim_occ       CHARACTER VARYING(35),
      sec_occ        CHARACTER VARYING(13),
      occ_type       SMALLINT, 
      prop_addr      CHARACTER VARYING(80), 
      prop_city      CHARACTER VARYING(50), 
      prop_st        CHARACTER VARYING(50), 
      prop_zip       CHARACTER VARYING(50), 
      mobilehome     CHARACTER VARYING(10), 
      outbldg        CHARACTER VARYING(13),
      height         REAL, 
      sqmeters       REAL, 
      sqfeet         REAL,
      h_adj_elev     REAL,
      l_adj_elev     REAL,
      base_elev_m    REAL, 
      fips           CHARACTER VARYING(50), 
      censuscode     CHARACTER VARYING(20), 
      prod_date      TIMESTAMP(6) WITH TIME ZONE, 
      source         CHARACTER VARYING(50), 
      usng           CHARACTER VARYING(50), 
      longitude      DOUBLE PRECISION, 
      latitude       DOUBLE PRECISION, 
      classification CHARACTER VARYING(50), 
      caveat         CHARACTER VARYING(50), 
      image_name     CHARACTER VARYING(50), 
      image_date     TIMESTAMP(6) WITH TIME ZONE, 
      val_method     CHARACTER VARYING(50), 
      remarks        CHARACTER VARYING(500), 
      shape_length   DOUBLE PRECISION, 
      shape_area     DOUBLE PRECISION, 
      derived_lng    DOUBLE PRECISION,
      derived_lat    DOUBLE PRECISION,
      shape          geometry, 
`;

export default createLayerTable(options, columns, seq);
