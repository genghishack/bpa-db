import {createLayerTable} from "../../migrateSQL.js";
import {LayerTableOptions} from "../../../types/migrate.js";

const seq = 114;

const options: LayerTableOptions = {
  load: false,
  schema: 'census_2020',
  tableName: 'edges',
  layerName: 'EDGES',
  layerDesc: 'All Lines',
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
    type: 'multilinestring',
  }
}

const columns = `
      gid           INTEGER NOT NULL,
      statefp       CHARACTER VARYING(2),
      countyfp      CHARACTER VARYING(3),
      tlid          BIGINT,
      tfidl         NUMERIC(10,0),
      tfidr         NUMERIC(10,0),
      mtfcc         CHARACTER VARYING(5),
      fullname      CHARACTER VARYING(100),
      smid          CHARACTER VARYING(22),
      lfromadd      CHARACTER VARYING(12),
      ltoadd        CHARACTER VARYING(12),
      rfromadd      CHARACTER VARYING(12),
      rtoadd        CHARACTER VARYING(12),
      zipl          CHARACTER VARYING(5),
      zipr          CHARACTER VARYING(5),
      featcat       CHARACTER VARYING(1),
      hydroflg      CHARACTER VARYING(1),
      railflg       CHARACTER VARYING(1),
      roadflg       CHARACTER VARYING(1),
      olfflg        CHARACTER VARYING(1),
      passflg       CHARACTER VARYING(1),
      exttyp        CHARACTER VARYING(1),
      ttyp          CHARACTER VARYING(1),
      deckedroad    CHARACTER VARYING(1),
      artpath       CHARACTER VARYING(1),
      persist       CHARACTER VARYING(1),
      gcseflg       CHARACTER VARYING(1),
      offsetl       CHARACTER VARYING(1),
      offsetr       CHARACTER VARYING(1),
      tnidf         NUMERIC(10,0),
      tnidt         NUMERIC(10,0),
      shape         geometry,
`;

export default createLayerTable(options, columns, seq);
