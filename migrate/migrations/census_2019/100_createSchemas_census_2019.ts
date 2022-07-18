import {createLayerSchemas} from "../../migrateSQL.js";
import {LayerSchemaOptions} from "../../../types/migrate.js";

const seq = 100;

const options: LayerSchemaOptions = {
  schema: 'census_2019',
  web_root: 'https://www2.census.gov',
  ftp_root: 'ftp.census.gov',
  base_path: '/geo/tiger/TIGER2019',
}

export default createLayerSchemas(options, seq);
