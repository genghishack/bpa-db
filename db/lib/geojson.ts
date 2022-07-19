import execa from "execa";
import {getTmpDir} from "./filesystem.js";
import {getGDALPGConnectionStr} from "../../lib/postgres.js";

export const loadFromGeoJsonFileToStaging = async () => {
  const {module, schema, layer} = layerOpts;
  log.info('Loading from GeoJSON file to staging table...');
  const tmpDir = await getTmpDir(module);
  const fileName = layer.dir!.split('.zip')[0];
  const layerName = fileName.split('.geojson')[0];
  log.debug({fileName});
  const cmd = `${process.env.GDALBIN}/ogr2ogr`;
  const params = [
    '-f "PostgreSQL"',
    `-lco SCHEMA="${schema.staging}"`,
    '-lco OVERWRITE=YES',
    '-lco GEOMETRY_NAME=shape',
    '-lco SPATIAL_INDEX=NONE',
    `PG:"${getGDALPGConnectionStr()}"`,
    `${tmpDir}/${fileName}/${fileName}`,
    `"${layerName}"`,
    '-overwrite',
    '-progress',
    '--config PG_USE_COPY YES',
    `-nln "${layer.table}"`,
    '-nlt PROMOTE_TO_MULTI'
  ]

  try {
    const {command, stdout} = await execa(cmd, params, {shell: true});
    // log.debug({command, stdout}); // This exposes passwords.
    // Leave commented except for local debugging.
  } catch (e) {
    return Promise.reject(e);
  }
}