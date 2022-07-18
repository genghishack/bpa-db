import {createLayerSchemas} from "../../migrateSQL.js";
import {LayerSchemaOptions} from "../../../types/migrate.js";

const seq = 100;

const options: LayerSchemaOptions = {
  schema: 'bing',
  web_root: 'https://usbuildingdata.blob.core.windows.net',
  ftp_root: '',
  base_path: '/usbuildings-v2',
}

export default createLayerSchemas(options, seq);
