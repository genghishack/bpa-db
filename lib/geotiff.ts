import {execa, execaCommandSync} from "execa";
import {LayerOptions} from "../types/etl.js";
import {getTmpDir} from "./filesystem.js";

export const loadGeoTiffToStaging = async (
  opts: LayerOptions
) => {
  const tmpDir = await getTmpDir(opts.module);
  const {PGBIN} = process.env;
  const sCmd = [
    `${PGBIN}/raster2pgsql`,
    '-d -F -I -C -t 256x256 -P -s 4326',
    `${tmpDir}/${opts.layer.dir}`,
    `${opts.schema.staging}.${opts.layer.table}`,
    `| ${PGBIN}/psql`
  ].join(' ');

  try {
    const {stdout} = await execaCommandSync(sCmd, {shell: true});
    return stdout;
  } catch (e) {
    return Promise.reject(e);
  }
}
