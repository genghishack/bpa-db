import ftp from "basic-ftp";
import {getTmpDir} from "./filesystem.js";
import {logDebug} from "./logging.js";
import {LayerOptions} from "../types/etl.js";

export const getFileFromFTP = async (
  fileName: string,
  opts: LayerOptions
) => {
  const client = new ftp.Client();
  const tmpDir = await getTmpDir(opts.module);
  try {
    await client.access({host: opts.source.ftp});
    await client.downloadTo(`${tmpDir}/${fileName}`, `${opts.layer.dir}/${fileName}`);
    client.close();
  } catch (e) {
    return Promise.reject(e);
  }
}

export const getFilesWithFTP = async (
  fileNames: {name: string}[],
  opts: LayerOptions
) => {
  try {
    await Promise.all(fileNames.map(async (fileObj: {name: string}) => {
      const fileName = fileObj.name;
      logDebug(`Downloading ${fileName}...`);
      await getFileFromFTP(fileName, opts);
    }))
  } catch (e) {
    return Promise.reject(e);
  }
}

// deprecated
export const chooseFTPDirNames = async (
  host: string,
  dir: string,
  filter: any[] = []
) => {
  logDebug(`Choosing FTP directory names from ${host}${dir}`);
  try {
    const allDirNames = await listDirNamesFromFTPDir(host, dir);
    // logDebug({allDirNames});
    if (!filter.length) return allDirNames;

    logDebug('Filtering directory names...');
    const filteredDirNames = allDirNames.filter(dirObj => {
      const dirName = dirObj.name;
      // @ts-ignore
      return filter.includes(dirName);
    })
    // logDebug({filteredDirNames});
    return filteredDirNames;
  } catch (e) {
    return Promise.reject(e);
  }
}

export const filterFilesFromFTPDir = async (
  contains: string,
  opts: LayerOptions
) => {
  console.log(`Filtering ${opts.layer.name} filenames from FTP Directory...`);
  try {
    const fileList = await listFilesFromFTPDir(opts.source.ftp, opts.layer.dir!);
    // logDebug({fileList});
    const fileNames = fileList.filter(fileObj => {
      return fileObj.name.indexOf(contains) !== -1
    })
    // logDebug({dir, fileNames});
    if (!fileNames.length) {
      console.log(`
        No files found in FTP dir for ${opts.layer.name}
        layer for FIPS ${opts.state.fips}
        (${opts.state.abbrev.toUpperCase()}).
      `);
    }
    return fileNames;
  } catch (e) {
    return Promise.reject(e);
  }
}

export const listDirNamesFromFTPDir = async (
  host: string,
  dir: string
) => {
  logDebug(`Getting directory names from ${host}...`);
  try {
    const dirList = await listFTPDir(host, dir);
    return dirList.filter(fileObj => {
      return fileObj.type === 2;
    })
  } catch (e) {
    return Promise.reject(e);
  }
}

export const listFilesFromFTPDir = async (
  host: string,
  dir: string
) => {
  logDebug(`Getting list of files from ${host}${dir}`);
  try {
    const dirList = await listFTPDir(host, dir);
    return dirList.filter(fileObj => {
      return fileObj.type === 1;
    })
  } catch (e) {
    return Promise.reject(e);
  }
}

export const listFTPDir = async (
  host: string,
  dir: string = '.'
) => {
  const client = new ftp.Client();
  try {
    await client.access({host});
    const fileList = await client.list(dir);
    const fileNames = fileList.map((obj) => {
      const {type, name} = obj;
      return {type, name};
    })
    // logDebug({fileNames});
    await client.close();
    return fileNames;
  } catch (e) {
    return Promise.reject(e);
  }
}
