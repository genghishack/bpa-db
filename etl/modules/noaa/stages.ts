import execa, {execaCommandSync} from "execa";
import fs from "fs";
import {getTmpDir, nullFn} from "../../../lib/filesystem.js";
import {insertHurdatRows, parseHurdatFile} from "../../../lib/hurdat.js";
import {loadFromStagingToData} from "../../../lib/load.js";
import {createDataTables} from "../../../lib/sql.js";
import {renameStagingTableField} from "../../../lib/transform.js";
import {getFile} from "../../../lib/wget.js";
import {LayerOptions} from "../../../types/etl.js";
import {HurdatFileRow} from "../../../types/hurdat.js";

export const getInstanceDescription = (
  opts: LayerOptions
) => {
  let description = opts.layer.name;
  if (opts.layer.prefix) {
    description = `${opts.layer.prefix} ${opts.layer.name}`;
  }
  return description;
}

export const loadHurdatToData = async (
  opts: LayerOptions,
) => {
  await createDataTables(opts);
  const hurdatRows: HurdatFileRow[] = await parseHurdatFile(opts);
  await insertHurdatRows(opts, hurdatRows);
}

export const loadToData = async (
  opts: LayerOptions,
) => {
  await createDataTables(opts);
  await renameStagingFields(opts);
  await loadFromStagingToData(opts);
}

const renameStagingFields = async (opts: LayerOptions) => {
  try {
    switch (opts.layer.name) {
      case 'storm_srfo_current':
        await renameStagingTableField('id', 'identifier', opts);
        break;
      case 'storm_ero_current':
        await renameStagingTableField('id', 'identifier', opts);
        break;
      case 'nws_flood_outlook':
        await renameStagingTableField('id', 'identifier', opts);
        break;
      case 'nws_excessive_rainfall':
        await renameStagingTableField('id', 'identifier', opts);
        break;
      case 'nws_wpc_qpf':
        await renameStagingTableField('id', 'identifier', opts);
        break;
      default:
        return Promise.resolve(null);
    }
  } catch (e) {
    return Promise.reject(e);
  }
}

export const unTarQPETarball = async (
  opts: LayerOptions,
) => {
  const tmpDir = await getTmpDir(opts.module);
  const sCmd = [
    `tar -C ${tmpDir}`,
    `-xvf ${tmpDir}/qpe${opts.layer.index}.tar`
  ].join(' ');

  try {
    const {stdout} = await execaCommandSync(sCmd, {shell: true});
    return stdout;
  } catch (e) {
    return Promise.reject(e);
  }
}

export const getQPETarball = async (
  baseUrl: string,
  subDir: string | null = null,
  opts: LayerOptions,
) => {
  const tmpDir = await getTmpDir(opts.module);
  const url = subDir ? `${baseUrl}/${subDir}` : `${baseUrl}`;
  const targetDir = subDir ? `${tmpDir}/${subDir}` : tmpDir;
  if (subDir) {
    fs.mkdir(targetDir, {recursive: true}, nullFn);
  }
  // logDebug({url});
  const sCmd = [
    `wget "${url}"`,
    `-O ${targetDir}/qpe${opts.layer.index}.tar`
  ].join(' ');

  try {
    const {stdout} = await execaCommandSync(sCmd, {shell: true});
    return stdout;
  } catch (e) {
    return Promise.reject(e);
  }
}

export const getQPETarballFromSource = async (
  opts: LayerOptions,
) => {
  console.log('Retrieving tarball from source...');
  const baseUrl = `${opts.source.url}${opts.source.path[opts.layer.index!]}`;
  await getQPETarball(baseUrl, null, opts);
  return Promise.resolve(null)
}

export const getFileFromSource = async (opts: LayerOptions) => {
  console.log('Retrieving file from source...');
  const baseUrl = `${opts.source.url}${opts.source.path}`;
  const fileName = opts.layer.dir;
  await getFile(fileName!, baseUrl, null, opts);
  return fileName;
}
