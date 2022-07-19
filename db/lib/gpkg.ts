import execa from "execa";
import {getGDALPGConnectionStr} from "../../lib/postgres.js";
import {fileExistsInTmpDir} from "./filesystem.js";

export const loadFromGPKGFileToStaging = async (
  filePath: string,
  geomType: string | null = null
) => {
  const {schema, layer} = layerOpts;
  log.info('Loading from GPKG to staging tables...');
  const fileExists = await fileExistsInTmpDir();
  log.info({fileExists});
  if (!fileExists) {
    log.info("NO FILE")
    return {type: 'msg', value: 'No GPKG file exists for this state.'};
  }

  const cmd = `${process.env.GDALBIN}/ogr2ogr`;
  const params = [
    '-f "PostgreSQL"',
    `-lco SCHEMA="${schema.staging}"`,
    '-lco OVERWRITE=YES',
    `PG:"${getGDALPGConnectionStr()}"`,
    `${filePath} ${layer.name}`,
    '-overwrite',
    '-progress',
    '-t_srs EPSG:4326',
    '--config PG_USE_COPY YES',
    `-nln ${layer.table}`,
  ];
  if (geomType) {
    params.push(`-nlt ${geomType}`);
  }

  try {
    const {command, stdout} = await execa(cmd, params, {shell: true});
    // log.debug({command, stdout}); // This exposes passwords.
    // Leave commented except for local debugging.
  } catch (e) {
    return Promise.reject(e);
  }
}
