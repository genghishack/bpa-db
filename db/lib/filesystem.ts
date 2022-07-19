import fs from "fs/promises";

export const nullFn = () => {};

export const getLogDir = async (module: string = '') => {
  let logDir = `${process.env.LOG_PATH}`;
  if (module !== '') {
    logDir += `/${module}`;
  }
  await fs.mkdir(logDir, {recursive: true});
  return logDir;
}

export const getTmpDir = async (module: string = '') => {
  let tmpDir = `${process.env.TMP_PATH}`;
  if (module !== '') {
    tmpDir += `/${module}`;
  }
  await fs.mkdir(tmpDir, {recursive: true});
  return tmpDir;
}

export const resetLogDir = async (module: string = '') => {
  const logDir = await getLogDir(module);
  await fs.rmdir(logDir, {recursive: true});
  await fs.mkdir(logDir, {recursive: true});
  return logDir;
}

export const resetTempDir = async (module: string = '') => {
  const tempDir = await getTmpDir(module);
  await fs.rmdir(tempDir, {recursive: true});
  await fs.mkdir(tempDir, {recursive: true});
  return tempDir;
}

export const resetDirs = async (module: string = '') => {
  try {
    await resetTempDir(module);
    await resetLogDir(module);
  } catch (e) {
    return Promise.reject(e);
  }
}

export const getFileNameFromDir = async (
  dir: string,
  match: RegExp|string,
  containsMatch: boolean = true
) => {
  try {
    const fileList: string[] = await fs.readdir(dir);
    // log.debug({fileList});
    const fileNames = fileList.filter((fileName: string) => {
      return containsMatch ? fileName.match(match) : !fileName.match(match);
    })
    const [fileName] = fileNames;
    return fileName;
  } catch (e) {
    return Promise.reject(e);
  }
}

export const getFileListFromDir = async (
  dir: string,
  match: RegExp|string,
  containsMatch: boolean = true
) => {
  try {
    const fileList: string[] = await fs.readdir(dir);
    // log.debug({fileList});
    const fileNames = fileList.filter((fileName: string) => {
      return containsMatch ? fileName.match(match) : !fileName.match(match);
    })
    return fileNames;
  } catch (e) {
    return Promise.reject(e);
  }
}

export const fileExistsInTmpDir = async () => {
  const {module, layer} = layerOpts;
  const tmpDir = await getTmpDir(module);
  log.debug({tmpDir, file: layer.dir})
  const fileName = await getFileNameFromDir(tmpDir, layer.dir!);
  return <boolean>!!fileName;
}