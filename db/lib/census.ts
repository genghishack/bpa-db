import fs from "fs";
import {FileObjList} from "../../types/general.js";
import {loadFromDBFToStagingTable, prepareStagingTableFromDBF} from "./dbf.js";
import {getFiles, getHtml} from "../../lib/wget.js";
import {unzipFiles} from "./extract.js";
import {getFileNameFromDir, getTmpDir} from "../../lib/filesystem.js";
import {loadFromStagingToData} from "../sql/load.js";
import {getLayerInstanceId, storeMetaDataInDB} from "../sql/metadata.js";
import {createDataTables} from "./load.js";
import {addFIPSConstraintToDataTable} from "../sql/transform.js";

export const getFileMatch = () => {
  const {year, state} = layerOpts;
  return `tl_${year}_${state.fips}`;
}

export const getFileNamesFromSource = async (
  fileMatch: string,
) => {
  const {source, layer} = layerOpts;
  try {
    const url: string = `${source.web}${source.path}/${layer.name}`;
    const layerPage = await getHtml(url, log);
    const matchStr = `<a href="${fileMatch}.*">tl_`
    const regexp = new RegExp(matchStr, "g");
    const matches = layerPage.match(regexp);
    // log.debug({layer: layer.name, regexp, matches});
    if (matches) {
      const fileNames = matches.map((match) => {
        return {name: match.split('"')[1].split('"')[0]}
      })
      // log.debug({layer: layer.name, fileNames})
      return fileNames;
    }
    return Promise.resolve([]);
  } catch (e) {
    return Promise.reject(e);
  }
}

export const getFilesFromSource = async () => {
  const {source, layer} = layerOpts;
  const fileMatch: string = getFileMatch();
  try {
    const fileNames = await getFileNamesFromSource(fileMatch)
    // log.debug({dir: layer.dir, fileNames});
    const baseUrl = `${source.url}${layer.dir}`;
    if (fileNames.length) {
      await getFiles(fileNames, baseUrl, null);
    }
    return fileNames;
  } catch (e) {
    return Promise.reject(e);
  }
}
export const getFileNamesFromTmpDir = async (
  fileMatch: string,
) => {
  const {module, state, layer} = layerOpts;
  log.debug(`Filtering ${layer.name} filenames from tmp directory...`)
  log.debug({fileMatch});
  const tmpDir = await getTmpDir(module);
  try {
    const fileList = fs.readdirSync(tmpDir);
    // log.debug({fileList});
    const fileNames = fileList.filter((fileName) => {
      const beginningAndEndMatch = (
        fileName.indexOf(fileMatch) === 0
        && fileName.match(/.zip$/)
      );
      let layerNameMatch;
      switch (layer.name) {
        case 'ADDR':
          layerNameMatch = fileName.match(/addr\W/)
          break;
        case 'TABBLOCK':
          layerNameMatch = fileName.match(/tabblock10/)
          break;
        default:
          layerNameMatch = fileName.includes(layer.name.toLowerCase())
      }
      // log.debug({layerNameMatch})
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
      log.info(`No files found in tmp dir for ${layer.name} layer for FIPS ${state.fips} (${state.abbrev.toUpperCase()}).`);
    }
    return fileObjs;
  } catch (e) {
    return Promise.reject(e);
  }
}
export const getFileList = async () => {
  const {user} = layerOpts;
  let fileNames: FileObjList = [];

  const fileMatch: string = getFileMatch()
  fileNames = await getFileNamesFromTmpDir(fileMatch);
  if (!fileNames.length || user.force) {
    fileNames = await getFilesFromSource();
  }
  // log.debug({fileNames});
  return fileNames;
}

export const getMetaDataForCensusDBF = async (
  fileName: string,
) => {
  const {module} = layerOpts;
  const tmpDir = await getTmpDir(module);
  // log.debug({fileName})
  const dirName = fileName.slice(0, -4);
  const pathToDir = `${tmpDir}/${dirName}`;
  const xmlFileName = await getFileNameFromDir(pathToDir, /shp.iso.xml$/);
  const eaXmlFileName = await getFileNameFromDir(pathToDir, /shp.ea.iso.xml$/);
  log.debug({fileName, dirName, xmlFileName, eaXmlFileName});
  const xml = fs.readFileSync(`${pathToDir}/${xmlFileName}`, 'utf8');
  const eaXml = fs.readFileSync(`${pathToDir}/${eaXmlFileName}`, 'utf8');
  return [
    {label: 'Abstract', xml: xml},
    {label: 'Entities & Attributes', xml: eaXml}
  ];
}

export const loadDataFromDBFFilesToStaging = async (
  fileList: FileObjList
) => {
  const {layer} = layerOpts;
  // Run through the filenames sequentially, first setting up the staging table
  log.info(`Loading to ${layer.name} staging table...`);
  await fileList.reduce(
    // This function runs second, once for each dbf
    (p, fileObj) => p.then(async () => {
      const fileName = fileObj.name;
      await loadFromDBFToStagingTable(fileName);
    }),
    // This function runs first, setting up the staging table
    (async () => {
      await prepareStagingTableFromDBF(fileList[0].name);
    })()
  );
}

export const loadToData = async () => {
  const {state} = layerOpts;
  await createDataTables();
  if (state.abbrev !== 'us') {
    await addFIPSConstraintToDataTable('statefp');
  }
  await loadFromStagingToData();
}

export const loadMetadata = async () => {
  try {
    const fileList = await getFileList();
    if (fileList.length) {
      await unzipFiles(fileList);

      const instanceRowId = await getLayerInstanceId();
      log.info({instanceRowId});
      if (instanceRowId) {
        const layerMetaData = await getMetaDataForCensusDBF(fileList[0].name);
        await storeMetaDataInDB(layerMetaData, instanceRowId);
      } else {
        log.info('No instance found.');
      }
    }
    return null;
  } catch (e) {
    return Promise.reject(e);
  }
}

