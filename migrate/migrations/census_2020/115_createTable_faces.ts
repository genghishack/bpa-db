import {createLayerTable} from "../../migrateSQL.js";
import {LayerTableOptions} from "../../../types/migrate.js";

const seq = 115;

const options: LayerTableOptions = {
  load: false,
  schema: 'census_2020',
  tableName: 'faces',
  layerName: 'FACES',
  layerDesc: 'Topological Faces (Polygons with All Geocodes)',
  pk: 'id',
  uidx: [],
  level: {
    county: true,
    state: false,
    nation: false,
  },
  columns_exclude: [],
  geom: {
    field: 'shape',
    dims: 2,
    srid: 4326,
    type: 'multipolygon',
  }
}

const columns = `
      gid           INTEGER NOT NULL,
      tfid          NUMERIC(10,0),
      statefp10     CHARACTER VARYING(2),
      countyfp10    CHARACTER VARYING(3),
      tractce10     CHARACTER VARYING(6),
      blkgrpce10    CHARACTER VARYING(1),
      blockce10     CHARACTER VARYING(4),
      suffix1ce     CHARACTER VARYING(1),
      zcta5ce10     CHARACTER VARYING(5),
      uace10        CHARACTER VARYING(5),
      pumace10      CHARACTER VARYING(5),
      statefp       CHARACTER VARYING(2),
      cd116fp       CHARACTER VARYING(2),
      countyfp      CHARACTER VARYING(3),
      tractce       CHARACTER VARYING(6),
      blkgrpce      CHARACTER VARYING(1),
      blockce       CHARACTER VARYING(4),
      cousubfp      CHARACTER VARYING(5),
      submcdfp      CHARACTER VARYING(5),
      estatefp      CHARACTER VARYING(5),
      conctyfp      CHARACTER VARYING(5),
      placefp       CHARACTER VARYING(5),
      aiannhfp      CHARACTER VARYING(5),
      aiannhce      CHARACTER VARYING(4),
      comptyp       CHARACTER VARYING(1),
      trsubfp       CHARACTER VARYING(5),
      trsubce       CHARACTER VARYING(3),
      anrcfp        CHARACTER VARYING(5),
      ttractce      CHARACTER VARYING(6),
      tblkgpce      CHARACTER VARYING(1),
      elsdlea       CHARACTER VARYING(5),
      scsdlea       CHARACTER VARYING(5),
      unsdlea       CHARACTER VARYING(5),
      sldust        CHARACTER VARYING(3),
      sldlst        CHARACTER VARYING(3),
      csafp         CHARACTER VARYING(3),
      cbsafp        CHARACTER VARYING(5),
      metdivfp      CHARACTER VARYING(5),
      cnectafp      CHARACTER VARYING(3),
      nectafp       CHARACTER VARYING(5),
      nctadvfp      CHARACTER VARYING(5),
      ztca5ce20     CHARACTER VARYING(12),
      lwflag        CHARACTER VARYING(1),
      "offset"      CHARACTER VARYING(1),
      atotal        DOUBLE PRECISION,
      intptlat      CHARACTER VARYING(11),
      intptlon      CHARACTER VARYING(12),
      shape         geometry,
`;

export default createLayerTable(options, columns, seq);
