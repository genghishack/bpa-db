import {execa} from "execa";
import {LayerOptions} from "../types/etl.js";
import {fileExistsInTmpDir, getFileNameFromDir} from "./filesystem.js";
import {logDebug} from "./logging.js";
import {getGDALPGConnectionStr} from "./postgres.js";

export const loadFromGPKGFileToStaging = async (
  filePath: string,
  opts: LayerOptions,
  geomType: string | null = null
) => {
  console.log('Loading from GPKG to staging tables...');
  const fileExists = await fileExistsInTmpDir(opts);
  console.log({fileExists});
  if (!fileExists) {
    console.log("NO FILE")
    return {type: 'msg', value: 'No GPKG file exists for this state.'};
  }

  const cmd = `${process.env.GDALBIN}/ogr2ogr`;
  const params = [
    '-f "PostgreSQL"',
    `-lco SCHEMA="${opts.schema.staging}"`,
    '-lco OVERWRITE=YES',
    `PG:"${getGDALPGConnectionStr()}"`,
    `${filePath} ${opts.layer.name}`,
    '-overwrite',
    '-progress',
    '-t_srs EPSG:4326',
    '--config PG_USE_COPY YES',
    `-nln ${opts.layer.table}`,
  ];
  if (geomType) {
    params.push(`-nlt ${geomType}`);
  }

  try {
    const {command, stdout} = await execa(cmd, params, {shell: true});
    logDebug({command, stdout});
  } catch (e) {
    return Promise.reject(e);
  }
}
