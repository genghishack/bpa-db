import extract from 'extract-zip';
import {logDebug} from "./logging.js";
import {getTmpDir} from "./filesystem.js";
import {FileObjList, LayerOptions, LoaderOptions} from "../types/etl.js";

export const unzipFile = async (
  fileName: string,
  opts: LoaderOptions,
  subDir: string|null = null,
  extractsToFolder: boolean = false
) => {
  const tmpDir: string = await getTmpDir(opts.module);
  let tmpPath = tmpDir;
  if (subDir) {
    tmpPath = `${tmpDir}/${subDir}`;
  }
  // logDebug({tmpPath});
  let options = {dir: `${tmpPath}/`};
  if (!extractsToFolder) {
    options = {dir: `${tmpPath}/${fileName.slice(0, -4)}`};
  }
  try {
    await extract(
      `${tmpPath}/${fileName}`,
      options
    );
    // logDebug(`extracted ${fileName}`);
  } catch (e) {
    return Promise.reject(e);
  }
}

export const unzipFiles = async (
  opts: LayerOptions,
  fileList: FileObjList,
  subDir: string | null = null,
  extractsToFolder: boolean = false
) => {
  try {
    await Promise.all(fileList.map(async (fileObj) => {
      const fileName = fileObj.name;
      console.log(`Unzipping ${fileName}...`);
      await unzipFile(fileName, opts, subDir, extractsToFolder);
    }))
  } catch (e) {
    return Promise.reject(e);
  }
}
