import execa from "execa";
import {pgQuery, getGDALPGConnectionStr} from "./postgres.js";
import {getTempDir} from "./common.js";
import {logDebug} from "./logging.js";

export const getLayersFromGDB = async (filePath, fileName) => {
  logDebug({filePath});
  const {GDALBIN} = process.env;
  const sCmd = `${GDALBIN}/ogrinfo -so -q -nogeomtype ${filePath}/${fileName} | cut -d ":" -f 2 | tr -d ' '`;
  logDebug(sCmd);
  try {
    const {stdout} = await execa.command(sCmd, {shell: true});
    logDebug(stdout);
    return stdout.split('\n');
  } catch (e) {
    return Promise.reject(e);
  }
}

export const getMetaDataFromGDB = async (filePath, fileName) => {
  const {GDALBIN} = process.env;

  try {
    const layers = await getLayersFromGDB(filePath, fileName);
    logDebug({layers});
    const metaData = await Promise.all(layers.map((layer) => {
      const rCmd = [
        `${GDALBIN}/ogrinfo`,
        `-sql "GetLayerMetadata ${layer}"`,
        `${filePath}/${fileName}`,
      ];
      const sCmd = rCmd.join(' ');
      logDebug(sCmd);
      const {stdout} = execa.command(sCmd, {shell: true});
      logDebug(stdout);
    }))
    logDebug({metaData});
  } catch (e) {
    return Promise.reject(e);
  }
}

export const loadMetaDataFromGDB = async (schema, filePath, fileName) => {
  const {GDALBIN} = process.env;

  try {
    const layers = await getLayersFromGDB(filePath, fileName);
    logDebug({layers});
    const metaDataLoad = await Promise.all(layers.map((layer) => {
      const rCmd = [
        `${GDALBIN}/ogr2ogr`,
        '-f "PostgreSQL"',
        `PG:"${getGDALPGConnectionStr()}"`,
        `-sql "GetLayerMetadata ${layer}" ${filePath}/${fileName}`,
        `-nln "${layer}_metadata"`,
        `-lco SCHEMA=${schema}_data`,
        '-overwrite',
      ];
      const sCmd = rCmd.join(' ');
      logDebug(sCmd);
      const {stdout} = execa.command(sCmd, {shell: true});
      logDebug(stdout);
    }))
    logDebug({metaDataLoad});
  } catch (e) {
    return Promise.reject(e);
  }
  // for fc in `ogrinfo -so -q -nogeomtype $GDBFILE | cut -d ":" -f 2 | tr -d ' '`; do
  //   echo "dumping metadata for ${​​​​​​​fc}​​​​​​​"
  // #ogrinfo -sql "GetLayerMetadata ${​​​​​​​fc}​​​​​​​" $GDBFILE > "$SCRATCHDIR/${​​​​​​​fc}​​​​​​​"
//  ogr2ogr -f "PostgreSQL" PG:"${getGDALPGConnection()}" -sql "GetLayerMetadata ${​​​​​​​fc}​​​​​​​" $GDBFILE -nln "${​​​​​​​fc}​​​​​​​_metadata" -lco SCHEMA=$SCHEMA -overwrite
  // done

}

export const loadFromStagingToData = async(schema, tableName, layerName) => {
  logDebug({tableName})
  const label = `load ${layerName} data from staging into data table`;
  const sql = `
    SELECT public.load_staged_data(lower('${schema}'), lower('${tableName}'), lower('${tableName}'));
  `;
  try {
    const dataLoad = await pgQuery(sql, [], label);
    console.log(`Loaded ${dataLoad[0].load_staged_data} ${layerName} rows`);
  } catch (e) {
    return Promise.reject(e);
  }
}

export const loadToStagingFromGDB = async (schema, filePath, fileName) => {
  console.log('Loading layers from GDB to staging tables...');
  const {GDALBIN} = process.env;
  const rCmd = [
    `${GDALBIN}/ogr2ogr`,
    '-f "PostgreSQL"',
    `-lco SCHEMA="${schema}_staging"`,
    '-lco OVERWRITE=YES',
    `PG:"${getGDALPGConnectionStr()}"`,
    `${filePath}/${fileName}`,
    '-overwrite',
    '-progress',
    '--config PG_USE_COPY YES'
  ];
  const sCmd = rCmd.join(' ');
  logDebug(sCmd);
  const {stdout} = await execa.command(sCmd, {shell: true});
  logDebug(stdout);

  try{
    const {stdout} = await execa.command(sCmd, {shell: true});
    logDebug(stdout);
  } catch (e) {
    return Promise.reject(e);
  }
}

export const prepareStagingTableFromDBF = async (schema, fileName, tableName) => {
  const tempDir = getTempDir();
  const fileBaseName = fileName.slice(0, -4);
  const filePath = `${tempDir}/${fileBaseName}/${fileBaseName}.dbf`;
  const stagingTableName = `${schema}_staging.${tableName}`;

  const {PGBIN} = process.env;
  const rCmd = [
    `${PGBIN}/shp2pgsql`,
    '-p', // Prepare table
    '-g the_geom', // Geometry column name to be created
    filePath,
    stagingTableName,
    `| ${PGBIN}/psql`
  ];
  const sCmd = rCmd.join(' ');
  logDebug(sCmd);

  try {
    const {stdout} = await execa.command(sCmd, {shell: true});
    logDebug(stdout);
    return Promise.resolve(stdout);
  } catch (e) {
    return Promise.reject(e);
  }
}

export const registerSource = async (schema, tableName, description) => {
  const label = 'register source';
  const sql = `
    INSERT INTO public.loader_source (source, description, schema, tablename) 
    VALUES ('${schema}', '${description}', '${schema}_data', '${tableName}')
    ON CONFLICT(schema, tablename) DO
    update SET updated_at = NOW()
    RETURNING id;
  `
  try {
    const rowId = await pgQuery(sql, [], label);
    return rowId[0].id;
  } catch (e) {
    return Promise.reject(e);
  }
}

export const registerMetadata = async (sourceRowId, fileName) => {
  // no-op
  return Promise.resolve(null);
}

export const loadFromDBFToStagingTable = async (schema, fileName, tableName) => {
  const tempDir = getTempDir();
  const fileBaseName = fileName.slice(0, -4);
  const filePath = `${tempDir}/${fileBaseName}/${fileBaseName}.dbf`;
  const stagingTableName = `${schema}_staging.${tableName}`;

  const {PGBIN} = process.env;
  const rCmd = [
    `${PGBIN}/shp2pgsql`,
    '-D', // Use postgresql dump format instead of insert statements
    '-a', // Appends data to existing table
    '-s 4269', // SRID identifier
    '-g the_geom', // Geometry column name to be created
    '-W "latin1"', // Character encoding of shapefile's attribute column
    filePath,
    stagingTableName,
    `| ${PGBIN}/psql`
  ];
  const sCmd = rCmd.join(' ');
  logDebug(sCmd);

  try {
    const {stdout} = await execa.command(sCmd, {shell: true});
    logDebug(stdout);
    return Promise.resolve(stdout);
  } catch (e) {
    return Promise.reject(e);
  }
}

