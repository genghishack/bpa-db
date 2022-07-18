import {createLayerSchemas} from "../../migrateSQL.js";
import {LayerSchemaOptions} from "../../../types/migrate.js";

const seq = 100;

const options: LayerSchemaOptions = {
  schema: 'ornl',
  web_root: 'https://disasters.geoplatform.gov',
  ftp_root: '',
  base_path: '/publicdata/Partners/ORNL/USA_Structures',
}

export default createLayerSchemas(options, seq);
