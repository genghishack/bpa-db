import {execa} from "execa";
import {LayerOptions} from "../types/etl.js";
import {logDebug} from "./logging.js";
import {getGDALPGConnectionStr} from "./postgres.js";

export const loadWFSLayerToStaging = async (opts: LayerOptions) => {
  const cmd = `${process.env.GDALBIN}/ogr2ogr`;
  const params = [
    '-ct "+proj=pipeline +step +proj=axisswap +order=2,1"',
    '-a_srs EPSG:4326 -overwrite',
    '-f "PostgreSQL"',
    `PG:"${getGDALPGConnectionStr()}"`,
    `"${opts.source.url}${opts.source.path}/${opts.layer.dir}"`,
    '-overwrite',
    '-progress',
    '--config PG_USE_COPY YES',
    '--config GDAL_HTTP_UNSAFESSL YES',
    `-nln ${opts.schema.staging}.${opts.layer.table}`,
    `-nlt ${opts.layer.geomType}`,
    '-nlt PROMOTE_TO_MULTI',
    '-lco GEOMETRY_NAME=shape'
  ];

  try {
    const {command, stdout} = await execa(cmd, params, {shell: true});
    logDebug({command, stdout});
  } catch (e) {
    return Promise.reject(e);
  }
}
