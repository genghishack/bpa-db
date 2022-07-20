import execa from "execa";
import {getTmpDir} from "../../lib/filesystem.js";

export const loadGeoTiffToStaging = async () => {
  const {module, layer, schema} = layerOpts;
  const tmpDir = await getTmpDir(module);
  const {PGBIN} = process.env;
  const sCmd = [
    `${PGBIN}/raster2pgsql`,
    '-d -F -I -C -t 256x256 -P -s 4326',
    `${tmpDir}/${layer.dir}`,
    `${schema.staging}.${layer.table}`,
    `| ${PGBIN}/psql`
  ].join(' ');

  try {
    const {stdout} = await execa.commandSync(sCmd, {shell: true});
    return stdout;
  } catch (e) {
    return Promise.reject(e);
  }
}
