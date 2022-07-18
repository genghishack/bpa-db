import {LayerOptions} from "../types/etl.js";
import {pgCleanString, pgQuery} from "./postgres.js";

export const storeMetaDataInDB = async (
  metadata: string,
  instanceId: string,
  opts: LayerOptions
) => {
  const label = 'store metadata';
  const sql = `
    INSERT INTO layer_mgt.layer_metadata (
      layer_instance_id, 
      metadata
    )
    VALUES (
      '${instanceId}', 
      '${pgCleanString(metadata)}'
    )
    ON CONFLICT (layer_instance_id) DO
    UPDATE SET 
      metadata = '${pgCleanString(metadata)}',
      updated_at = NOW();
  `;
  return pgQuery(sql, [], label);
}

export const storeEAMetaDataInDB = async (
  metadata: string,
  instanceId: string,
  opts: LayerOptions
) => {
  const label = 'store metadata';
  const sql = `
    INSERT INTO layer_mgt.layer_metadata (
      layer_instance_id, 
      metadata_ea
    )
    VALUES (
      '${instanceId}', 
      '${pgCleanString(metadata)}'
    )
    ON CONFLICT (layer_instance_id) DO
    UPDATE SET 
      metadata_ea = '${pgCleanString(metadata)}',
      updated_at = NOW();
  `;
  return pgQuery(sql, [], label);
}

// TODO: This was for loading the metadata directly into the DB (not used)
// export const loadMetaDataFromGDB = async (
//   schema: string,
//   filePath: string,
//   fileName: string
// ) => {
//   const {GDALBIN} = process.env;
//
//   try {
//     const layers = await getLayerNamesFromGDB(filePath, fileName);
//     logDebug({layers});
//     const metaDataLoad = await Promise.all(layers.map((layer) => {
//       const sCmd = [
//         `${GDALBIN}/ogr2ogr`,
//         '-f "PostgreSQL"',
//         `PG:"${getGDALPGConnectionStr()}"`,
//         `-sql "GetLayerMetadata ${layer}" ${filePath}/${fileName}`,
//         `-nln "${layer}_metadata"`,
//         `-lco SCHEMA=${schema}_data`,
//         '-overwrite',
//       ].join(' ');
//       logDebug(sCmd);
//       const {stdout} = execa.command(sCmd, {shell: true});
//       logDebug(stdout);
//     }))
//     logDebug({metaDataLoad});
//   } catch (e) {
//     return Promise.reject(e);
//   }
//   // for fc in `ogrinfo -so -q -nogeomtype $GDBFILE | cut -d ":" -f 2 | tr -d ' '`; do
//   //   echo "dumping metadata for ${​​​​​​​fc}​​​​​​​"
//   // #ogrinfo -sql "GetLayerMetadata ${​​​​​​​fc}​​​​​​​" $GDBFILE > "$SCRATCHDIR/${​​​​​​​fc}​​​​​​​"
// //  ogr2ogr -f "PostgreSQL" PG:"${getGDALPGConnection()}" -sql "GetLayerMetadata ${​​​​​​​fc}​​​​​​​" $GDBFILE -nln "${​​​​​​​fc}​​​​​​​_metadata" -lco SCHEMA=$SCHEMA -overwrite
//   // done
//
// }
