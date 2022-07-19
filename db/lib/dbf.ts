import execa from "execa";
import {getTmpDir} from "./filesystem.js";

export const prepareStagingTableFromDBF = async (
  fileName: string,
) => {
  const {module, schema, layer} = layerOpts;
  const tmpDir = await getTmpDir(module);
  const fileBaseName = fileName.slice(0, -4);

  const {PGBIN} = process.env;
  const sCmd = [
    `${PGBIN}/shp2pgsql`,
    '-p', // Prepare table
    '-g shape', // Geometry column name to be created
    `${tmpDir}/${fileBaseName}/${fileBaseName}.dbf`,
    `${schema.staging}.${layer.table}`,
    `| ${PGBIN}/psql`
  ].join(' ');
  log.debug(sCmd);

  try {
    const {stdout} = await execa.command(sCmd, {shell: true});
    log.debug(stdout);
    return Promise.resolve(stdout);
  } catch (e) {
    return Promise.reject(e);
  }
}

export const loadFromDBFToStagingTable = async (
  fileName: string,
) => {
  const {module, schema, layer} = layerOpts;
  const tmpDir = await getTmpDir(module);
  const fileBaseName = fileName.slice(0, -4);

  const {PGBIN} = process.env;
  const sCmd = [
    `${PGBIN}/shp2pgsql`,
    '-D', // Use postgresql dump format instead of insert statements
    '-a', // Appends data to existing table
    '-s 4326', // SRID identifier
    '-g shape', // Geometry column name to be created
    '-W "latin1"', // Character encoding of shapefile's attribute column
    `${tmpDir}/${fileBaseName}/${fileBaseName}.dbf`,
    `${schema.staging}.${layer.table}`,
    `| ${PGBIN}/psql`
  ].join(' ');
  log.debug(sCmd);

  try {
    const {stdout} = await execa.command(sCmd, {shell: true});
    log.debug(stdout);
    return Promise.resolve(stdout);
  } catch (e) {
    return Promise.reject(e);
  }
}
