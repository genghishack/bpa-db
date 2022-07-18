import {execa, execaCommand, execaCommandSync} from "execa";
import fs from "fs";
import {LoaderOptions} from "../types/etl.js";
import {getTmpDir, nullFn} from "./filesystem.js";
import {logDebug} from "./logging.js";

export const getHtml = async (url: string) => {
  try {
    const {stdout} = await execaCommand(`wget ${url} -O -`, {shell: true});
    // logDebug(stdout);
    return stdout;
  } catch (e) {
    return Promise.reject(e);
  }
}

export const getFile = async (
  fileName: string,
  baseUrl: string,
  subDir: string|null = null,
  opts: LoaderOptions
) => {
  const tmpDir = await getTmpDir(opts.module);
  const url = subDir? `${baseUrl}/${subDir}/${fileName}` : `${baseUrl}/${fileName}`;
  const targetDir = subDir ? `${tmpDir}/${subDir}` : tmpDir;
  if (subDir) {
    fs.mkdir(targetDir, {recursive: true}, nullFn);
  }
  // logDebug({url});
  const sCmd = [
    `wget ${url}`,
    `-O ${targetDir}/${fileName}`
  ].join(' ');

  try {
    const {stdout} = await execaCommandSync(sCmd, {shell: true});
    return stdout;
  } catch (e) {
    return Promise.reject(e);
  }
}

export const getFiles = async (
  fileNames: {name: string}[],
  baseUrl: string,
  subDir: string|null = null,
  opts: LoaderOptions
) => {
  try {
    await fileNames.reduce(
      (p: Promise<any>, fileObj) => p.then(async () => {
        const fileName = fileObj.name;
        logDebug(`Downloading ${fileName}...`);
        const stdout = await getFile(fileName, baseUrl, subDir, opts);
        logDebug(stdout);
      }),
      (async () => {
        return Promise.resolve(null);
      })()
    )
  } catch (e) {
    return Promise.reject(e);
  }
}
