import {createLayerTable} from "../../migrateSQL.js";
import {LayerTableOptions} from "../../../types/migrate.js";

const seq = 116;

const options: LayerTableOptions = {
  load: false,
  schema: 'census_2019',
  tableName: 'featnames',
  layerName: 'FEATNAMES',
  layerDesc: 'Feature Names Relationship',
  pk: 'id',
  uidx: [],
  level: {
    county: true,
    state: false,
    nation: false,
  },
  columns_exclude: ["id","statefp"],
  geom: 'none'
}

const columns = `
      statefp    CHARACTER VARYING(2),
      gid        INTEGER NOT NULL,
      tlid       BIGINT,
      fullname   CHARACTER VARYING(100),
      name       CHARACTER VARYING(100),
      predirabrv CHARACTER VARYING(15),
      pretypabrv CHARACTER VARYING(50),
      prequalabr CHARACTER VARYING(15),
      sufdirabrv CHARACTER VARYING(15),
      suftypabrv CHARACTER VARYING(50),
      sufqualabr CHARACTER VARYING(15),
      predir     CHARACTER VARYING(2),
      pretyp     CHARACTER VARYING(3),
      prequal    CHARACTER VARYING(2),
      sufdir     CHARACTER VARYING(2),
      suftyp     CHARACTER VARYING(3),
      sufqual    CHARACTER VARYING(2),
      linearid   CHARACTER VARYING(22),
      mtfcc      CHARACTER VARYING(5),
      paflag     CHARACTER VARYING(1),
`;

export default createLayerTable(options, columns, seq);
