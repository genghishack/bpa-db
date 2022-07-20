import ftp from "basic-ftp";
import {getTmpDir} from "./filesystem.js";
import {LayerOptions} from "../types/etl";

export const getFileFromFTP = async (
  fileName: string,
  opts: LayerOptions,
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
  opts: LayerOptions,
) => {
  try {
    await Promise.all(fileNames.map(async (fileObj: {name: string}) => {
      const fileName = fileObj.name;
      log.debug(`Downloading ${fileName}...`);
      await getFileFromFTP(fileName, opts);
    }))
  } catch (e) {
    return Promise.reject(e);
  }
}

export const filterFilesFromFTPDir = async (
  contains: string,
  opts: LayerOptions,
) => {
  log.info(`Filtering ${opts.layer.name} filenames from FTP Directory...`);
  try {
    const fileList = await listFilesFromFTPDir(opts.source.ftp, opts.layer.dir!);
    // log.debug({fileList});
    const fileNames = fileList.filter(fileObj => {
      return fileObj.name.indexOf(contains) !== -1
    })
    // log.debug({dir, fileNames});
    if (!fileNames.length) {
      log.info(`
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
  dir: string,
) => {
  log.debug(`Getting directory names from ${host}...`);
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
  dir: string,
) => {
  log.debug(`Getting list of files from ${host}${dir}`);
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
  dir: string = '.',
) => {
  const client = new ftp.Client();
  try {
    await client.access({host});
    const fileList = await client.list(dir);
    const fileNames = fileList.map((obj) => {
      const {type, name} = obj;
      return {type, name};
    })
    // log.debug({fileNames});
    await client.close();
    return fileNames;
  } catch (e) {
    return Promise.reject(e);
  }
}
