import execa from "execa";
import {getGDALPGConnectionStr} from "../../lib/postgres.js";

export const loadWFSLayerToStaging = async () => {
  const {source, layer, schema} = layerOpts;
  const cmd = `${process.env.GDALBIN}/ogr2ogr`;
  const params = [
    '-ct "+proj=pipeline +step +proj=axisswap +order=2,1"',
    '-a_srs EPSG:4326 -overwrite',
    '-f "PostgreSQL"',
    `PG:"${getGDALPGConnectionStr()}"`,
    `"${source.url}${source.path}/${layer.dir}"`,
    '-overwrite',
    '-progress',
    '--config PG_USE_COPY YES',
    '--config GDAL_HTTP_UNSAFESSL YES',
    `-nln ${schema.staging}.${layer.table}`,
    `-nlt ${layer.geomType}`,
    '-nlt PROMOTE_TO_MULTI',
    '-lco GEOMETRY_NAME=shape'
  ];

  try {
    const {command, stdout} = await execa(cmd, params, {shell: true});
    // log.debug({command, stdout}); // This exposes passwords.
    // Leave commented except for local debugging.
  } catch (e) {
    return Promise.reject(e);
  }
}