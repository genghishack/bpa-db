import {createLayerTable} from "../../migrateSQL.js";
import {LayerTableOptions} from "../../../types/migrate.js";

const seq = 110;

const options: LayerTableOptions = {
  load: true,
  schema: 'template',
  tableName: 'template_layer',
  layerName: 'template_layer',
  layerDesc: 'Template Layer',
  pk: 'id',
  uidx: [],
  level: {
    county: false,
    state: true,
    nation: false,
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
`;

export default createLayerTable(options, columns, seq);
