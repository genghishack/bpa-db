import execa from "execa";
import {getTmpDir} from "../../lib/filesystem.js";
import {getGDALPGConnectionStr} from "../../lib/postgres.js";

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
    log.debug({command, stdout});
    return stdout.split('\n');
  } catch (e) {
    return Promise.reject(e);
  }
}

export const getLayerNamesFromGDB = async (
  fileName: string,
  subDir: string | null = null
) => {
  const tmpDir = await getTmpDir(loaderOpts.module);
  const fileDir = subDir ? `${tmpDir}/${subDir}` : tmpDir;
  const {GDALBIN} = process.env;
  const sCmd = [
    `${GDALBIN}/ogrinfo`,
    '-so -q -nogeomtype',
    `${fileDir}/${fileName}`,
    `| cut -d ":" -f 2 | tr -d ' '`
  ].join(' ');
  log.debug(sCmd);

  try {
    const {stdout} = await execa.command(sCmd, {shell: true});
    log.debug({stdout});
    return stdout.split('\n');
  } catch (e) {
    return Promise.reject(e);
  }
}

export const getMetaDataForGDBLayer = async (
  filePath: string,
  gdbLayerName: string,
) => {
  const {state, layer} = layerOpts;
  const layerName: string = gdbLayerName || `${state.abbrev}_${layer.name}`;
  const cmd: string = `${process.env.GDALBIN}/ogrinfo`;
  const params: string[] = [
    '-q -geom=NO',
    `-sql "GetLayerMetadata ${layerName}"`,
    filePath,
    `|tr -d '\r\n'`
  ];

  try {
    const {command, stdout} = await execa(cmd, params, {shell: true});
    // log.debug({command, stdout});
    const metadata = stdout.split(' = ')[1];
    return {
      label: 'metadata',
      xml: metadata
    }
  } catch (e) {
    return Promise.reject(e);
  }
}

export const loadFromGDBFileToStaging = async (
  filePath: string,
  layerName: string | null = null,
  geomType: string | null = null
) => {
  const {schema} = layerOpts;
  log.info('Loading from GDB to staging tables...');
  const cmd = `${process.env.GDALBIN}/ogr2ogr`;
  const params = [
    '-f "PostgreSQL"',
    `-lco SCHEMA="${schema.staging}"`,
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
    // log.debug({command, stdout}); // This exposes passwords.
    // Leave commented except for local debugging.
  } catch (e) {
    return Promise.reject(e);
  }
}
