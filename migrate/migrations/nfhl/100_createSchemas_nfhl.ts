import {createLayerSchemas} from "../../migrateSQL.js";
import {LayerSchemaOptions} from "../../../types/migrate.js";

const seq = 100;

const options: LayerSchemaOptions = {
  schema: 'nfhl',
  web_root: '',
  ftp_root: '',
  base_path: '',
}

export default createLayerSchemas(options, seq);
