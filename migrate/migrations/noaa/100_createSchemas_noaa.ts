import {createLayerSchemas} from "../../migrateSQL.js";
import {LayerSchemaOptions} from "../../../types/migrate.js";

const seq = 100;

const options: LayerSchemaOptions = {
  schema: 'noaa',
  web_root: 'http://idpgis.ncep.noaa.gov',
  ftp_root: '',
  base_path: '/arcgis/services',
}

export default createLayerSchemas(options, seq);
