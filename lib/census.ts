import fs from "fs";
import {FileObjList, LayerOptions} from "../types/etl.js";
import {loadFromDBFToStagingTable, prepareStagingTableFromDBF} from "./dbf.js";
import {getFileNameFromDir, getTmpDir} from "./filesystem.js";
import {loadFromStagingToData} from "./load.js";
import {logDebug} from "./logging.js";
import {createDataTables} from "./sql.js";
import {addFIPSConstraintToDataTable} from "./transform.js";
import {getFiles, getHtml} from "./wget.js";

export const getFileMatch = (opts: LayerOptions) => {
  return `tl_${opts.year}_${opts.state.fips}`;
}

export const getFileNamesFromSource = async (
  fileMatch: string,
  opts: LayerOptions
) => {
  try {
    const url: string = `${opts.source.web}${opts.source.path}/${opts.layer.name}`;
    const layerPage = await getHtml(url);
    const matchStr = `<a href="${fileMatch}.*">tl_`
    const regexp = new RegExp(matchStr, "g");
    const matches = layerPage.match(regexp);
    // logDebug({layer: opts.layer.name, regexp, matches});
    if (matches) {
      const fileNames = matches.map((match: any) => {
        return {name: match.split('"')[1].split('"')[0]}
      })
      // logDebug({layer: opts.layer.name, fileNames})
      return fileNames;
    }
    return Promise.resolve([]);
  } catch (e) {
    return Promise.reject(e);
  }
}

export const getFilesFromSource = async (opts: LayerOptions) => {
  const fileMatch: string = getFileMatch(opts);
  try {
    const fileNames = await getFileNamesFromSource(fileMatch, opts)
    // logDebug({dir: layerOpts.layer.dir, fileNames});
    const baseUrl = `${opts.source.url}${opts.layer.dir}`;
    if (fileNames.length) {
      await getFiles(fileNames, baseUrl, null, opts);
    }
    return fileNames;
  } catch (e) {
    return Promise.reject(e);
  }
}
export const getFileNamesFromTmpDir = async (
  fileMatch: string,
  opts: LayerOptions
) => {
  console.log(`Filtering ${opts.layer.name} filenames from tmp directory...`)
  logDebug({fileMatch});
  const tmpDir = await getTmpDir(opts.module);
  try {
    const fileList = fs.readdirSync(tmpDir);
    // logDebug({fileList});
    const fileNames = fileList.filter((fileName) => {
      const beginningAndEndMatch = (
        fileName.indexOf(fileMatch) === 0
        && fileName.match(/.zip$/)
      );
      let layerNameMatch;
      switch (opts.layer.name) {
        case 'ADDR':
          layerNameMatch = fileName.match(/addr\W/)
          break;
        case 'TABBLOCK':
          layerNameMatch = fileName.match(/tabblock10/)
          break;
        default:
          layerNameMatch = fileName.includes(opts.layer.name.toLowerCase())
      }
      // logDebug({layerNameMatch})
      return (
        beginningAndEndMatch
        && layerNameMatch
      );
    })
    const fileObjs: { name: string }[] = [];
    fileNames.forEach((fileName) => {
      fileObjs.push({name: fileName})
    })
    if (!fileNames.length) {
      console.log(`No files found in tmp dir for ${opts.layer.name} layer for FIPS ${opts.state.fips} (${opts.state.abbrev.toUpperCase()}).`);
    }
    return fileObjs;
  } catch (e) {
    return Promise.reject(e);
  }
}
export const getFileList = async (opts: LayerOptions) => {
  let fileNames: FileObjList = [];

  const fileMatch: string = getFileMatch(opts)
  fileNames = await getFileNamesFromTmpDir(fileMatch, opts);
  if (!fileNames.length || opts.user.force) {
    fileNames = await getFilesFromSource(opts);
  }
  // logDebug({fileNames});
  return fileNames;
}

export const getMetaDataForCensusDBF = async (
  fileName: string,
  opts: LayerOptions
) => {
  const tmpDir = await getTmpDir(opts.module);
  // logDebug({fileName})
  const dirName = fileName.slice(0, -4);
  const pathToDir = `${tmpDir}/${dirName}`;
  const xmlFileName = await getFileNameFromDir(pathToDir, /shp.iso.xml$/);
  const eaXmlFileName = await getFileNameFromDir(pathToDir, /shp.ea.iso.xml$/);
  logDebug({fileName, dirName, xmlFileName, eaXmlFileName});
  const xml = fs.readFileSync(`${pathToDir}/${xmlFileName}`, 'utf8');
  const eaXml = fs.readFileSync(`${pathToDir}/${eaXmlFileName}`, 'utf8');
  return {xml, eaXml};
}

export const loadDataFromDBFFilesToStaging = async (
  opts: LayerOptions,
  fileList: FileObjList
) => {
  // Run through the filenames sequentially, first setting up the staging table
  console.log(`Loading to ${opts.layer.name} staging table...`);
  await fileList.reduce(
    // This function runs second, once for each dbf
    (p, fileObj) => p.then(async () => {
      const fileName = fileObj.name;
      await loadFromDBFToStagingTable(fileName, opts);
    }),
    // This function runs first, setting up the staging table
    (async () => {
      await prepareStagingTableFromDBF(fileList[0].name, opts);
    })()
  );
}

export const loadToData = async (
  opts: LayerOptions,
) => {
  await createDataTables(opts);
  if (opts.state.abbrev !== 'us') {
    await addFIPSConstraintToDataTable('statefp', opts);
  }
  await loadFromStagingToData(opts);
}
