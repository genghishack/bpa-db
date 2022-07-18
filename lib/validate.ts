import {getLayerOptions} from "../etl/modules/census_2020/options.js";
import {LayerOptions, idObj, LayerRecord} from "../types/etl.js";
import {logDebug} from "./logging.js";
import {pgQuery} from "./postgres.js";
import {checkTableExists} from "./sql.js";
import {nullPromise} from "./utils.js";

export const findInvalidGeomsInDataTable = async (
  opts: LayerOptions
) => {
  console.log(`Finding invalid geometries in ${opts.schema.data}.${opts.layer.table}...`);
  const label = 'find invalid geometries';
  const sql = `
    SELECT ${opts.layer.pk}
    FROM ${opts.schema.data}.${opts.layer.table}
    WHERE st_isvalid(shape) = false;
  `
  return pgQuery(sql, [], label);
}

export const markInvalidGeomsInDataTable = async (
  opts: LayerOptions,
  invalidIds: idObj[]
) => {
  const label = 'mark invalid geoms';
  const idArray = invalidIds.map((obj:idObj) => `'${obj.id}'`);
  const idArraySql = `(${idArray.join(',')})`;

  const sql = `
    UPDATE ${opts.schema.data}.${opts.layer.table}
    SET shape_invalid = true
    WHERE ${opts.layer.pk} IN ${idArraySql}
    RETURNING ${opts.layer.pk};
  `;
  return pgQuery(sql, [], label);
}

export const insertValidGeomsIntoSecondaryGeomTable = async (
  opts: LayerOptions,
  invalidIds: idObj[]
) => {
  let i = 0
  const total = invalidIds.length;
  await invalidIds.reduce(
    (p: Promise<any>, invalidId) => p.then(async () => {
      i++;
      const label = `store valid geom for ${invalidId.id} in secondary geom table (${i} of ${total})`;
      const sql = `
        INSERT INTO ${opts.schema.data}.${opts.layer.table}_geom
        (primary_id, shape_valid)
        VALUES (
            '${invalidId.id}',
            st_makevalid(
                (SELECT shape
                FROM ${opts.schema.data}.${opts.layer.table}
                WHERE id = '${invalidId.id}')
            )
        )
        ON CONFLICT (primary_id)
        DO
            UPDATE SET shape_valid = st_makevalid(
                (SELECT shape
                FROM ${opts.schema.data}.${opts.layer.table}
                WHERE id = '${invalidId.id}')
            );
      `;
      return pgQuery(sql, [], label);
    }),
    nullPromise()
  )
}

export const validateGeometries = async (opts: LayerOptions) => {
  console.log(`Validating ${opts.layer.table} geometries...`);
  try {

    const tableExists = await checkTableExists(opts.schema.data, opts.layer.table);
    if (!tableExists) return {type: 'msg', value: `No ${opts.schema.data}.${opts.layer.table} exists.`};

    const geomTableExists = await checkTableExists(opts.schema.data, `${opts.layer.table}_geom`);
    if (!geomTableExists) return {type: 'msg', value: `No ${opts.schema.data}.${opts.layer.table}_geom exists.`};

    const invalidIds: idObj[] = await findInvalidGeomsInDataTable(opts);
    logDebug({invalidIds});
    console.log(`rows with invalid geoms for ${opts.layer.table}:`, invalidIds.length);

    if (invalidIds.length) {
      const markedIds: idObj[] = await markInvalidGeomsInDataTable(opts, invalidIds);
      // logDebug({markedIds});

      console.log(`Storing valid geoms in ${opts.layer.table}_geom...`)
      await insertValidGeomsIntoSecondaryGeomTable(opts, invalidIds);
    }
    return null;

  } catch (e) {
    return Promise.reject(e);
  }
}
