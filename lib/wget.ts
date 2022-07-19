import execa from "execa";
import fs from "fs";
import {getTmpDir, nullFn} from "../db/lib/filesystem.js";

export const getHtml = async (
  url: string,
  log: any
) => {
  try {
    const {stdout} = await execa.command(`wget ${url} -O -`, {shell: true});
    // log.debug(stdout);
    return stdout;
  } catch (e) {
    return Promise.reject(e);
  }
}

export const wgetFile = async (
  fileName: string,
  baseUrl: string,
  subDir: string|null = null,
) => {
  const tmpDir = await getTmpDir(loaderOpts.module);
  const url = subDir? `${baseUrl}/${subDir}/${fileName}` : `${baseUrl}/${fileName}`;
  const targetDir = subDir ? `${tmpDir}/${subDir}` : tmpDir;
  if (subDir) {
    fs.mkdir(targetDir, {recursive: true}, nullFn);
  }
  // log.debug({url});
  const sCmd = [
    `wget ${url}`,
    `-O ${targetDir}/${fileName}`
  ].join(' ');

  try {
    const {stdout} = await execa.commandSync(sCmd, {shell: true});
    return stdout;
  } catch (e) {
    return Promise.reject(e);
  }
}

export const getFiles = async (
  fileNames: {name: string}[],
  baseUrl: string,
  subDir: string|null = null,
) => {
  try {
    await fileNames.reduce(
      (p: Promise<any>, fileObj) => p.then(async () => {
        const fileName = fileObj.name;
        log.info(`Downloading ${fileName}...`);
        const stdout = await wgetFile(fileName, baseUrl, subDir);
        log.debug(stdout);
      }),
      (async () => {
        return Promise.resolve(null);
      })()
    )
  } catch (e) {
    return Promise.reject(e);
  }
}
