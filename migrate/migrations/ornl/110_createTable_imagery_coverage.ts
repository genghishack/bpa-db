import {createLayerTable} from "../../migrateSQL.js";
import {LayerTableOptions} from "../../../types/migrate.js";

const seq = 110;

const options: LayerTableOptions = {
  load: true,
  schema: 'ornl',
  tableName: 'imagery_coverage',
  layerName: 'imagery_coverage',
  layerDesc: 'Imagery Coverage',
  pk: 'id',
  uidx: ['objectid'],
  level: {
    county: false,
    state: true,
    nation: false,
  },
  columns_exclude: ['id','statefp','shape_invalid'],
  geom: {
    field: 'shape',
    srid: 4326,
    dims: 2,
    type: 'multipolygon',
  }
}

const columns = `
      statefp          CHARACTER VARYING(2),
      objectid         INTEGER NOT NULL,
      image_name       CHARACTER VARYING(100),
      cloud_cover      REAL,
      acquisition_date TIMESTAMP(6) WITH TIME ZONE,
      shape_length     DOUBLE PRECISION,
      shape_area       DOUBLE PRECISION,
      shape            geometry,
`;

export default createLayerTable(options, columns, seq);
