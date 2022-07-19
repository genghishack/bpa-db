import extract from 'extract-zip';
import {FileObjList} from "../../types/general.js";
import {getTmpDir} from "./filesystem.js";

export const unzipFile = async (
  fileName: string,
  subDir: string|null = null,
  extractsToFolder: boolean = false
) => {
  log.info(`Unzipping file ${fileName}...`)
  const tmpDir: string = await getTmpDir(loaderOpts.module);
  let tmpPath = tmpDir;
  if (subDir) {
    tmpPath = `${tmpDir}/${subDir}`;
  }
  // log.debug({tmpPath});
  let options = {dir: `${tmpPath}/`};
  if (!extractsToFolder) {
    options = {dir: `${tmpPath}/${fileName.slice(0, -4)}`};
  }
  try {
    await extract(
      `${tmpPath}/${fileName}`,
      options
    );
    // log.debug(`extracted ${fileName}`);
  } catch (e) {
    return Promise.reject(e);
  }
}

export const unzipFiles = async (
  fileList: FileObjList,
  subDir: string | null = null,
  extractsToFolder: boolean = false
) => {
  try {
    await Promise.all(fileList.map(async (fileObj) => {
      const fileName = fileObj.name;
      log.info(`Unzipping ${fileName}...`);
      await unzipFile(fileName, subDir, extractsToFolder);
    }))
  } catch (e) {
    return Promise.reject(e);
  }
}
