export type Migration = {
  seq: number;
  label: string;
  sql: string;
}

export type UserOptions = {
  module: string|null;
  clear: boolean;
  start: number|null;
  end: number|null;
}

export type LayerSchemaOptions = {
  schema: string;
  web_root: string;
  ftp_root: string;
  base_path: string;
}

type GeomType = 'point' | 'polygon' | 'multipolygon' | 'multilinestring';

export type LayerTableOptions = {
  load: boolean;
  schema: string;
  tableName: string;
  layerName: string;
  layerDesc: string;
  pk: 'id';
  uidx: string[];
  level: {
    county: boolean;
    state: boolean;
    nation: boolean;
  }
  columns_exclude: string[];
  geom: 'none' | {
    field: 'shape';
    srid: 4326;
    dims: 2;
    type?: GeomType | GeomType[];
  };
}
