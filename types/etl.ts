export type EtlStages = {
  resetDirs: boolean;
  getFilesFromSource?: boolean;
  unzipFiles?: boolean;
  getFileNamesFromTmpDir?: boolean;
  resetStagingSchema: boolean;
  loadToStaging: boolean;
  registerLayerInstance: boolean;
  loadMetaData: boolean;
  loadToData: boolean;
  validateGeometries?: boolean;
}

export type UserOptions = {
  module: string;
  state: string;
  layer?: string;
  offset?: number;
  validate: boolean;
  force: boolean;
}

export type LoaderOptions = {
  module: string;
  user: UserOptions;
  year?: number;
  offset?: number;
  schema: {
    base: string;
    data: string;
    staging: string;
  }
  source: {
    web: string;
    ftp: string;
    url: string;
    path: string|string[];
  }
  state: {
    abbrev: string;
    name: string;
    fips: string;
  }
}

export type FileObj = {name: string};
export type FileObjList = FileObj[];

export type SubLayer = {
  prefix: string;
  dir: string;
  type: string;
  index?: number;
}

export type Layer = {
  name: string;
  pk: string;
  table: string;
  parentTable: string;
  dir?: string;
  index?: number;
  prefix?: string;
  type?: string;
  subLayer?: SubLayer[]
  geomType?: string;
  county?: string;
}

export type LayerOptions =
  LoaderOptions & {
  layer: Layer;
}

export type LayerRecord = {
  table_name: string;
  pk_name: string;
  layer_name: string;
  level_county: boolean;
  level_state: boolean;
  level_nation: boolean;
}

export type SchemaConfig = {
  base_schema: string;
  data_schema: string;
  staging_schema: string;
  web_root: string;
  ftp_root: string;
  base_path: string;
}

export type PgColumnObjType = {
  name: string;
  esriName?: string;
  type: string;
  quote: boolean;
}

export type idObj = { id: string | number }