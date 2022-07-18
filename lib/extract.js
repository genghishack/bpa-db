import ftp from 'basic-ftp';
import * as fs from 'fs';
import extract from 'extract-zip';
import execa from "execa";
import stream from 'stream';
import {promisify} from 'util';
import got from 'got';
import {logDebug} from "./logging.js";
import {getTempDir, getLogDir, nullFn} from "./common.js";

export const getHtmlWithWget = async (url) => {
  try {
    const {stdout} = await execa.command(`wget ${url} -O -`, {shell: true});
    // logDebug(stdout);
    return stdout;
  } catch (e) {
    return Promise.reject(e);
  }
}

export const saveFileToTempWithWget = async (baseUrl, fileName, tempSubDir) => {
  const tempDir = getTempDir();
  fs.mkdir(`${tempDir}/${tempSubDir}`, {recursive: true}, nullFn);

  const pipeline = promisify(stream.pipeline);
  const url = `${baseUrl}/${fileName}`;
  logDebug({url});
  try {
    await pipeline(
      got.stream(url),
      fs.createWriteStream(`${tempDir}/${tempSubDir}/${fileName}`)
    );
  } catch (e) {
    return Promise.reject(e);
  }
}

export const getAndExtractFilesWithWget = async (baseUrl, fileName, tempSubDir) => {
  try {
    console.log(`Downloading zip file for ${tempSubDir}...`);
    await saveFileToTempWithWget(baseUrl, fileName, tempSubDir);
    console.log(`Unzipping ${fileName}...`)
    await unzipFile(fileName, tempSubDir, true)
  } catch (e) {
    return Promise.reject(e);
  }
}

export const getAndExtractFilesWithFTP = async (host, dir, fileNames) => {
  try {
    await Promise.all(fileNames.map(async (fileObj) => {
      const fileName = fileObj.name;
      logDebug(`Downloading ${fileName}...`);
      await getFileFromFTP(host, dir, fileName);
      logDebug(`Unzipping ${fileName}...`);
      await unzipFile(fileName);
    }))
  } catch (e) {
    return Promise.reject(e);
  }
}

export const unzipFile = async (fileName, subDir = null, extractsToFolder = false) => {
  const tempDir = getTempDir();
  let tempPath = tempDir;
  if (subDir) {
    tempPath = `${tempDir}/${subDir}`;
  }
  // logDebug({tempPath});
  let opts = {dir: `${tempPath}/`};
  if (!extractsToFolder) {
    opts = {dir: `${tempPath}/${fileName.slice(0, -4)}`};
  }
  try {
    await extract(
      `${tempPath}/${fileName}`,
      opts
    );
    logDebug(`extracted ${fileName}`);
  } catch (e) {
    return Promise.reject(e);
  }
}

export const getFileFromFTP = async (host, filePath, fileName) => {
  const client = new ftp.Client();
  const tempDir = getTempDir();
  try {
    await client.access({host});
    await client.downloadTo(`${tempDir}/${fileName}`, `${filePath}/${fileName}`);
    client.close();
  } catch (e) {
    return Promise.reject(e);
  }
}

export const chooseFTPDirNames = async (host, dir, filter= []) => {
  logDebug(`Choosing FTP directory names from ${host}${dir}`);
  try {
    const allDirNames = await listDirNamesFromFTPDir(host, dir);
    // logDebug({allDirNames});
    if (!filter.length) return allDirNames;

    logDebug('Filtering directory names...');
    const filteredDirNames = allDirNames.filter(dirObj => {
      const dirName = dirObj.name;
      return filter.includes(dirName);
    })
    // logDebug({filteredDirNames});
    return filteredDirNames;
  } catch (e) {
    return Promise.reject(e);
  }
}

export const filterFilesFromFTPDir = async (host, dir, contains) => {
  try {
    const fileList = await listFilesFromFTPDir(host, dir);
    // logDebug({fileList});
    return fileList.filter(fileObj => {
      return fileObj.name.indexOf(contains) !== -1
    })
  } catch (e) {
    return Promise.reject(e);
  }
}

export const listDirNamesFromFTPDir = async (host, dir) => {
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

export const listFilesFromFTPDir = async (host, dir) => {
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

export const listFTPDir = async (host, dir = '.') => {
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
