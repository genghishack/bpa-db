import {execa} from "execa";
import * as fs from "fs/promises";
import {unzipFile} from "../../../lib/extract.js";
import {getFileNameFromDir, getTmpDir} from "../../../lib/filesystem.js";
import {loadFromStagingToData} from "../../../lib/load.js";
import {createDataTables} from "../../../lib/sql.js";
import {
  addFIPSConstraintToDataTable,
  addStagingTableField,
  renameStagingTableField
} from "../../../lib/transform.js";
import {capitalizeAndCompressString, nullPromise} from "../../../lib/utils.js";
import {pgQuery} from "../../../lib/postgres.js";
import {logDebug} from "../../../lib/logging.js";
import {getFile, getHtml} from "../../../lib/wget.js";
import {LayerOptions, LoaderOptions} from "../../../types/etl.js";

export const getInstanceDescription = (
  opts: LayerOptions
) => {
  return `${opts.state.abbrev.toUpperCase()} ${opts.layer.name}`;
}

export const loadToData = async (
  opts: LayerOptions,
) => {
  await createDataTables(opts);
  await addFIPSConstraintToDataTable('statefp', opts);
  await loadFromStagingToData(opts);
  if (opts.layer.name.includes('structures')) {
    await addLatLngFromCenterPoints(opts);
    const deletedIds = await removeDuplicates(opts);
    logDebug(`Deleted ${deletedIds.length} duplicates`);
    await addPlusCodes(opts);
  }
}

export const getGDBLayerName = (
  opts: LayerOptions,
  gdbLayerNames: string[]
) => {
  let gdbLayerName: string;
  // States that have one layer only have a structures layer
  if (gdbLayerNames.length === 1) {
    gdbLayerName = gdbLayerNames[0];
    if (opts.layer.name !== 'structures') {
      return null;
    }
    // Everything else
  } else {
    ([gdbLayerName] = gdbLayerNames.filter(layerName => {
      return layerName.toLowerCase() === opts.layer.table;
    }))
  }
  return gdbLayerName;
}

const getTableStructureType = async (
  gdbLayerName: string,
  opts: LayerOptions
) => {
  const stateDir = await getStateDir(opts);
  const fullLayerName = gdbLayerName || `${opts.state.abbrev}_${opts.layer.name}`
  const cmd = `${process.env.GDALBIN}/ogrinfo`;
  let fileDir, fileName, filePath;
  try {
    const dirName = await getFileNameFromDir(stateDir, /.zip$/, false)
    if (dirName.match(/.gdb$/)) {
      filePath = `${stateDir}/${dirName}`;
    } else {
      fileDir = `${stateDir}/${dirName}`;
      fileName = await getFileNameFromDir(fileDir, /.gdb$/);
      filePath = `${fileDir}/${fileName}`
    }

    const params = [
      '-so',
      '-al',
      filePath,
      fullLayerName,
    ]
    const {command, stdout} = await execa(cmd, params);
    // logDebug({command, stdout});

    if (stdout.includes('BUILDING_ID:')) {
      return 'AL';
    } else if (stdout.includes('BUILD_ID:')) {
      return 'DE';
    } else {
      return 'unknown';
    }
  } catch (e) {
    return Promise.reject(e);
  }
}

const renameStagingTable = async (
  oldName: string,
  newName: string,
  opts: LayerOptions
) => {
  const label = 'rename staging table';
  const sql = `
      ALTER TABLE ${opts.schema.staging}.${oldName}
          RENAME TO ${newName};
  `;
  return pgQuery(sql, [], label);
}

export const alterStagingTable = async (
  opts: LayerOptions,
  gdbLayerName: string
) => {
  console.log('Altering Staging Table...');
  try {
    // Kludge for DC and TX
    if (gdbLayerName === 'Texas' || gdbLayerName === 'districtOfColumbia') {
      await renameStagingTable(
        gdbLayerName.toLowerCase(),
        `${opts.state.abbrev.toLowerCase()}_structures`,
        opts
      );
    }

    switch (opts.layer.name) {
      case 'imagery_coverage':
        return Promise.resolve(null);
      case 'structures':
      case 'structures_raw':
        // first check to see what kind of table it is
        const tableType = await getTableStructureType(gdbLayerName, opts);
        logDebug({tableType});
        switch (tableType) {
          case 'AL':
            await renameStagingTableField('building_id', 'build_id', opts);
            await renameStagingTableField('squaremeters', 'sqmeters', opts);
            await renameStagingTableField('im_date', 'image_date', opts);
            await addStagingTableField('occ_cls', 'TEXT', opts);
            await addStagingTableField('prim_occ', 'TEXT', opts);
            await addStagingTableField('sec_occ', 'TEXT', opts);
            await addStagingTableField('sqfeet', 'FLOAT', opts);
            await addStagingTableField('h_adj_elev', 'FLOAT', opts);
            await addStagingTableField('l_adj_elev', 'FLOAT', opts);
            break;
          case 'DE':
            await addStagingTableField('occ_type', 'INT', opts);
            await addStagingTableField('mobilehome', 'TEXT', opts);
            await addStagingTableField('base_elev_m', 'FLOAT', opts);
            await addStagingTableField('classification', 'TEXT', opts);
            await addStagingTableField('caveat', 'TEXT', opts);
            break;
          default:
            return Promise.resolve(null);
        }
        break;
      default:
        return Promise.resolve(null);
    }
  } catch (e) {
    return Promise.reject(e);
  }
}

export const addLatLngFromCenterPoints = async (opts: LayerOptions) => {
  console.log('Deriving lat/lng from centerpoints...')
  const label = 'derive lat/lngs';
  const sql = `
      UPDATE ${opts.schema.data}.${opts.layer.table}
      SET derived_lng = st_x(st_centroid(shape)),
          derived_lat = st_y(st_centroid(shape));
  `;
  return pgQuery(sql, [], label);
}

export const removeDuplicates = async (opts: LayerOptions) => {
  console.log('Removing duplicate geoms..');
  const label = 'remove duplicate geoms';
  let sql;
  if (opts.state.abbrev === 'OR') {
    sql = `
      -- find and delete duplicates
      WITH duplicate_ids AS (
        -- In some cases, shape contains a short value and is identical with other rows
        -- that contain this same value.  However, the lat/lngs are different.
        SELECT array_agg(objectid) AS objectids, shape, derived_lat
        FROM ${opts.schema.data}.${opts.layer.table}
        WHERE shape IS NOT NULL
        GROUP BY shape, derived_lat
        HAVING count(*) > 1
      ),
      duplicate_rows AS (
        -- usng is null in some states' duplicates, this lets us weed those out
        SELECT objectid, build_id, usng, shape,
          ROW_NUMBER() OVER (PARTITION BY (shape) ORDER BY usng ASC, build_id DESC) AS rn
        FROM ${opts.schema.data}.${opts.layer.table}
        WHERE objectid IN (SELECT unnest(objectids) FROM duplicate_ids)
      )
      --SELECT * FROM duplicate_rows;
      DELETE FROM ${opts.schema.data}.${opts.layer.table}
      WHERE objectid IN(SELECT objectid FROM duplicate_rows WHERE rn > 1)
      RETURNING objectid;
    `;
  } else {
    sql = `
      -- find and delete duplicates
      WITH duplicate_ids AS (
        -- In some cases, shape contains a short value and is identical with other rows
        -- that contain this same value.  However, the lat/lngs are different.
        SELECT array_agg(objectid) AS objectids, shape, latitude
        FROM ${opts.schema.data}.${opts.layer.table}
        WHERE shape IS NOT NULL
        GROUP BY shape, latitude
        HAVING count(*) > 1
      ),
      duplicate_rows AS (
        -- usng is null in some states' duplicates, this lets us weed those out
        SELECT objectid, build_id, usng, shape,
          ROW_NUMBER() OVER (PARTITION BY (shape) ORDER BY usng ASC, build_id DESC) AS rn
        FROM ${opts.schema.data}.${opts.layer.table}
        WHERE objectid IN (SELECT unnest(objectids) FROM duplicate_ids)
      )
      --SELECT * FROM duplicate_rows;
      DELETE FROM ${opts.schema.data}.${opts.layer.table}
      WHERE objectid IN(SELECT objectid FROM duplicate_rows WHERE rn > 1)
      RETURNING objectid;
    `;
  }
  return pgQuery(sql, [], label);
}

export const addPlusCodes = async (opts: LayerOptions) => {
  console.log('Adding pluscodes...')
  const label = 'add plus codes';
  const sql = `
      UPDATE ${opts.schema.data}.${opts.layer.table}
      SET pluscode = (pluscode_encode(derived_lat::numeric, derived_lng::numeric, 16));
  `
  return pgQuery(sql, [], label);
}

const getFileNameFromSource = async (
  baseUrl: string,
  stateName: string
) => {
  try {
    const statePage = await getHtml(`${baseUrl}/${stateName}`);
    // logDebug({statePage});

    const filePath = statePage.split('<p><a href="')[1].split('" target="')[0];
    logDebug({filePath});

    const rFilePath = filePath.split('/');
    const fileName = rFilePath[rFilePath.length - 1];
    logDebug({fileName});
    return fileName;
  } catch (e) {
    return Promise.reject(e);
  }
}

export const getStateName = (opts: LoaderOptions) => {
  return capitalizeAndCompressString(opts.state.name);
}

const getStateDir = async (opts: LoaderOptions) => {
  const tmpDir: string = await getTmpDir(opts.module)
  const stateName: string = getStateName(opts);
  const stateDir = `${tmpDir}/${stateName}`;
  try {
    await fs.mkdir(stateDir, {recursive: true});
    return stateDir;
  } catch (e) {
    return e;
  }
}

const getPathToGDB = async (opts: LoaderOptions) => {
  const stateDir = await getStateDir(opts);
  const pathToGDB = await getFileNameFromDir(
    stateDir,
    /.zip$/,
    false
  );
  logDebug({uncompressedZip: pathToGDB});
  if (pathToGDB) {
    if (pathToGDB.match(/.gdb$/)) {
      return `${stateDir}/${pathToGDB}`;
    } else {
      const gdbFile = await getFileNameFromDir(
        `${stateDir}/${pathToGDB}`,
        /.gdb$/
      );
      if (gdbFile) {
        return `${stateDir}/${pathToGDB}/${gdbFile}`;
      }
      return nullPromise();
    }
  }
  return nullPromise();
}

export const getFilePath = async (opts: LoaderOptions) => {
  const stateName: string = getStateName(opts);
  const stateDir = await getStateDir(opts);

  try {
    let pathToGDB = await getPathToGDB(opts);
    if (!pathToGDB) {
      let zipFile = await getFileNameFromDir(stateDir, /.zip$/);
      if (!zipFile) {
        await getFilesFromSource(opts);
        zipFile = await getFileNameFromDir(stateDir, /.zip$/);
      }
      if (zipFile) {
        await unzipFile(zipFile, opts, stateName, true);
        pathToGDB = await getPathToGDB(opts);
      }
    }
    if (pathToGDB) {
      return pathToGDB;
    }
    return Promise.reject(new Error('No file found'));
  } catch (e) {
    return Promise.reject(e);
  }
}

export const getFilesFromSource = async (opts: LoaderOptions) => {
  const baseUrl: string = `${opts.source.url}${opts.source.path}`;
  const stateName: string = getStateName(opts);

  // get the filename to download from source
  const fileName = await getFileNameFromSource(baseUrl, stateName);

  if (fileName) {
    // download the file from source
    await getFile(fileName, baseUrl, stateName, opts);
  }

  return fileName;
}

export const getFileNamesFromTmpDir = async (opts: LoaderOptions) => {
  console.log(`Getting filename for ${opts.state.abbrev.toUpperCase()} from tmp directory...`);
  const stateDir = await getStateDir(opts);
  try {
    const zipFile: string = await getFileNameFromDir(stateDir, /.zip$/);
    if (!zipFile) {
      console.log(`No files found in ${stateDir} for ${opts.state.abbrev.toUpperCase()}.`);
    } else {
      logDebug({fileName: zipFile});
    }
    return zipFile;
  } catch (e) {
    return Promise.reject(e);
  }
}
