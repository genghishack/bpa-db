import {execa, execaCommand} from "execa";
import {LayerOptions, LoaderOptions} from "../types/etl.js";
import {getTmpDir} from "./filesystem.js";
import {logDebug} from "./logging.js";
import {getGDALPGConnectionStr} from "./postgres.js";

export const getLayerNamesFromGDBFile = async (filePath: string) => {
  const cmd = `${process.env.GDALBIN}/ogrinfo`;
  const params = [
    '-so',
    '-q',
    '-nogeomtype',
    filePath,
    `| cut -d ":" -f 2 | tr -d ' '`
  ];

  try {
    const {command, stdout} = await execa(cmd, params, {shell: true});
    logDebug({command, stdout});
    return stdout.split('\n');
  } catch (e) {
    return Promise.reject(e);
  }
}

export const getLayerNamesFromGDB = async (
  fileName: string,
  opts: LoaderOptions,
  subDir: string | null = null
) => {
  const tmpDir = await getTmpDir(opts.module);
  const fileDir = subDir ? `${tmpDir}/${subDir}` : tmpDir;
  const {GDALBIN} = process.env;
  const sCmd = [
    `${GDALBIN}/ogrinfo`,
    '-so -q -nogeomtype',
    `${fileDir}/${fileName}`,
    `| cut -d ":" -f 2 | tr -d ' '`
  ].join(' ');
  logDebug(sCmd);

  try {
    const {stdout} = await execaCommand(sCmd, {shell: true});
    logDebug({stdout});
    return stdout.split('\n');
  } catch (e) {
    return Promise.reject(e);
  }
}

export const getMetaDataForGDBLayer = async (
  filePath: string,
  gdbLayerName: string,
  opts: LayerOptions
) => {
  const layerName: string = gdbLayerName || `${opts.state.abbrev}_${opts.layer.name}`;
  const cmd: string = `${process.env.GDALBIN}/ogrinfo`;
  const params: string[] = [
    '-q -geom=NO',
    `-sql "GetLayerMetadata ${layerName}"`,
    filePath,
    `|tr -d '\r\n'`
  ];

  try {
    const {command, stdout} = await execa(cmd, params, {shell: true});
    // logDebug({command, stdout});
    return stdout.split(' = ')[1];
  } catch (e) {
    return Promise.reject(e);
  }
}

export const loadFromGDBFileToStaging = async (
  filePath: string,
  opts: LayerOptions,
  layerName: string | null = null,
  geomType: string | null = null
) => {
  console.log('Loading from GDB to staging tables...');
  const cmd = `${process.env.GDALBIN}/ogr2ogr`;
  const params = [
    '-f "PostgreSQL"',
    `-lco SCHEMA="${opts.schema.staging}"`,
    '-lco OVERWRITE=YES',
    `PG:"${getGDALPGConnectionStr()}"`,
    `${filePath} ${(layerName) ? layerName : ''}`,
    '-overwrite',
    '-progress',
    '-t_srs EPSG:4326',
    '--config PG_USE_COPY YES'
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
