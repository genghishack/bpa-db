import {createLayerTable} from "../../../sql/migrate.js";
import {LayerTableOptions} from "../../../../types/migrate.js";

const seq = 111;

const options: LayerTableOptions = {
  load: false,
  schema: 'census_2020',
  tableName: 'addrfeat',
  layerName: 'ADDRFEAT',
  layerDesc: 'Address Range Feature',
  pk: 'id',
  uidx: [],
  level: {
    county: true,
    state: false,
    nation: false,
  },
  columns_exclude: ['id','statefp','shape_invalid'],
  geom: {
    field: 'shape',
    dims: 2,
    srid: 4326,
    type: 'multilinestring',
  }
}

const columns = `
      statefp       CHARACTER VARYING(2) NOT NULL,
      gid           INTEGER NOT NULL,
      tlid          BIGINT,
      tfidl         BIGINT,
      tfidr         BIGINT,
      aridl         CHARACTER VARYING(22),
      aridr         CHARACTER VARYING(22),
      linearid      CHARACTER VARYING(22),
      fullname      CHARACTER VARYING(100),
      lfromhn       CHARACTER VARYING(12),
      ltohn         CHARACTER VARYING(12),
      rfromhn       CHARACTER VARYING(12),
      rtohn         CHARACTER VARYING(12),
      zipl          CHARACTER VARYING(5),
      zipr          CHARACTER VARYING(5),
      edge_mtfcc    CHARACTER VARYING(5),
      road_mtfcc    CHARACTER VARYING(5),
      parityl       CHARACTER VARYING(1),
      parityr       CHARACTER VARYING(1),
      plus4l        CHARACTER VARYING(4),
      plus4r        CHARACTER VARYING(4),
      lfromtyp      CHARACTER VARYING(1),
      ltotyp        CHARACTER VARYING(1),
      rfromtyp      CHARACTER VARYING(1),
      rtotyp        CHARACTER VARYING(1),
      offsetl       CHARACTER VARYING(1),
      offsetr       CHARACTER VARYING(1),
      shape         geometry,
`;

export default createLayerTable(options, columns, seq);
