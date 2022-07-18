import {createLayerTable} from "../../migrateSQL.js";
import {LayerTableOptions} from "../../../types/migrate.js";

const seq = 110;

const options: LayerTableOptions = {
  load: false,
  schema: 'census_2020',
  tableName: 'addr',
  layerName: 'ADDR',
  layerDesc: 'Address Range Relationship',
  pk: 'id',
  uidx: [],
  level: {
    county: true,
    state: false,
    nation: false,
  },
  columns_exclude: ["id", "statefp"],
  geom: 'none',
}

const columns = `
      statefp   CHARACTER VARYING(2),
      gid       INTEGER NOT NULL,
      tlid      BIGINT,
      fromhn    CHARACTER VARYING(12),
      tohn      CHARACTER VARYING(12),
      side      CHARACTER VARYING(1),
      zip       CHARACTER VARYING(5),
      plus4     CHARACTER VARYING(4),
      fromtyp   CHARACTER VARYING(1),
      totyp     CHARACTER VARYING(1),
      arid      CHARACTER VARYING(22),
      mtfcc     CHARACTER VARYING(5),
`;

export default createLayerTable(options, columns, seq);
