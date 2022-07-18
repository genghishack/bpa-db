import {execa} from "execa";
import {LayerOptions} from "../types/etl.js";
import {getTmpDir} from "./filesystem.js";
import {logDebug} from "./logging.js";
import {getGDALPGConnectionStr} from "./postgres.js";

export const loadFromGeoJsonFileToStaging = async (
  opts: LayerOptions
) => {
  console.log('Loading from GeoJSON file to staging table...');
  const tmpDir = await getTmpDir(opts.module);
  const fileName = opts.layer.dir!.split('.zip')[0];
  const layerName = fileName.split('.geojson')[0];
  logDebug({fileName});
  const cmd = `${process.env.GDALBIN}/ogr2ogr`;
  const params = [
    '-f "PostgreSQL"',
    `-lco SCHEMA="${opts.schema.staging}"`,
    '-lco OVERWRITE=YES',
    '-lco GEOMETRY_NAME=shape',
    '-lco SPATIAL_INDEX=NONE',
    `PG:"${getGDALPGConnectionStr()}"`,
    `${tmpDir}/${fileName}/${fileName}`,
    `"${layerName}"`,
    '-overwrite',
    '-progress',
    '--config PG_USE_COPY YES',
    `-nln "${opts.layer.table}"`,
    '-nlt PROMOTE_TO_MULTI'
  ]

  try {
    const {command, stdout} = await execa(cmd, params, {shell: true});
    logDebug({command, stdout});
  } catch (e) {
    return Promise.reject(e);
  }
}
