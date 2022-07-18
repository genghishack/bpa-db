import {execa, execaCommand} from "execa";
import {LayerOptions} from "../types/etl.js";
import {getTmpDir} from "./filesystem.js";
import {logDebug} from "./logging.js";

export const prepareStagingTableFromDBF = async (
  fileName: string,
  opts: LayerOptions
) => {
  const tmpDir = await getTmpDir(opts.module);
  const fileBaseName = fileName.slice(0, -4);

  const {PGBIN} = process.env;
  const sCmd = [
    `${PGBIN}/shp2pgsql`,
    '-p', // Prepare table
    '-g shape', // Geometry column name to be created
    `${tmpDir}/${fileBaseName}/${fileBaseName}.dbf`,
    `${opts.schema.staging}.${opts.layer.table}`,
    `| ${PGBIN}/psql`
  ].join(' ');
  logDebug(sCmd);

  try {
    const {stdout} = await execaCommand(sCmd, {shell: true});
    logDebug(stdout);
    return Promise.resolve(stdout);
  } catch (e) {
    return Promise.reject(e);
  }
}
export const loadFromDBFToStagingTable = async (
  fileName: string,
  opts: LayerOptions
) => {
  const tmpDir = await getTmpDir(opts.module);
  const fileBaseName = fileName.slice(0, -4);

  /*
  export PGPORT=5432
  export PGHOST=localhost
  export PGUSER=postgres
  export PGPASSWORD=squirrel1
  export PGDATABASE=pivot

  shp2pgsql -D -a -s 4326 -g shape -W "latin1" \
  /mnt/hgfs/shared/noaa/al072021_5day_latest/al072021-017a_5day_lin.dbf \
  noaa.al072021-017a_5day_lin | psql

  sudo shp2pgsql -s 4326 -g shape \
  /var/tmp/noaa/al072021_5day_latest/*_lin.dbf \
  noaa.al072021-017a_5day_lin | psql
   */

  const {PGBIN} = process.env;
  const sCmd = [
    `${PGBIN}/shp2pgsql`,
    '-D', // Use postgresql dump format instead of insert statements
    '-a', // Appends data to existing table
    '-s 4326', // SRID identifier
    '-g shape', // Geometry column name to be created
    '-W "latin1"', // Character encoding of shapefile's attribute column
    `${tmpDir}/${fileBaseName}/${fileBaseName}.dbf`,
    `${opts.schema.staging}.${opts.layer.table}`,
    `| ${PGBIN}/psql`
  ].join(' ');
  logDebug(sCmd);

  try {
    const {stdout} = await execaCommand(sCmd, {shell: true});
    logDebug(stdout);
    return Promise.resolve(stdout);
  } catch (e) {
    return Promise.reject(e);
  }
}
