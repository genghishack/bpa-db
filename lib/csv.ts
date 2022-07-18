import fs from "fs";
import csv from "csv-parser";
import {pgCleanString, pgQuery} from "./postgres.js";
import * as gis from "./gis.js";
import {logDebug} from "./logging.js";

const nullUserId = '00000000-0000-0000-0000-000000000000';

const writeRowToStagingTable = async (row: any, fieldNames: any) => {
  const label = 'write rows to staging table';
  const params: string[] = [];
  const values = fieldNames.map((fieldName: string) => {
    return `${row[fieldName] ? `'${row[fieldName]}'` : `NULL`}`;
  }).join(',\n');
  const sql = `
    INSERT INTO app.gis_resource_staging (
      ${fieldNames.join(',\n')}
    )
    VALUES
    (
      ${values}
    )
    RETURNING name_json;
  `;
  try {
    return pgQuery(sql, params, label);
  } catch (e) {
    return Promise.reject(e);
  }
}

export const writeRowsToStaging = async (rows: any[]) => {
  await rows.reduce(
    (p, row) => p.then(async () => {
      const [written] = await writeRowToStagingTable(row, Object.keys(row));
      //@ts-ignore
      const name_json = JSON.parse(written.name_json);
      console.log(`Wrote ${name_json.first} ${name_json.last} to staging`)
    }),
    (async () => {
      return Promise.resolve(null);
    })()
  )
}

export const createStagingTable = async (fieldNames: string[]) => {
  const label = 'create resource staging table';
  const params: string[] = [];
  const sql = `
    DROP TABLE if exists app.gis_resource_staging;
    CREATE TABLE app.gis_resource_staging (
        id UUID DEFAULT uuid_generate_v1() NOT NULL,
        ${fieldNames.join(' TEXT,\n')} TEXT
    );
  `;
  return pgQuery(sql, params, label);
}

export const geocodeRows = async (rows: any[]) => {
  const geocodedRows: any[] = [];
  try {
    await rows.reduce(
      (p, row) => p.then(async () => {
        // logDebug({row})
        const geocode = await gis.geocode(JSON.parse(row.address_json));
        // logDebug({geocode})
        if (geocode) {
          geocodedRows.push({
            ...row,
            lat: geocode.latLng.lat,
            lng: geocode.latLng.lng,
            latlng: `{${geocode.latLng.lat},${geocode.latLng.lng}}`
          })
        } else {
          geocodedRows.push({
            ...row,
            lat: null,
            lng: null,
            latLng: null
          })
        }
      }),
      (async () => {
        return Promise.resolve(null)
      })()
    )
    return geocodedRows;
  } catch (e) {
    return Promise.reject(e);
  }
}

const getAddrJson = (row: any) => {
  return JSON.stringify({
    street_1: row.addr_street || '',
    street_2: '',
    city: row.addr_city || '',
    state: row.addr_state || '',
    country: row.addr_country || '',
    postalCode: row.addr_postal_code || '',
  })
}

const getPhoneJson = (row: any) => {
  return JSON.stringify({
    main: row.phone_main || '',
    fax: row.phone_fax || '',
    cell: row.phone_cell || '',
  })
}

const getNameJson = (row: any) => {
  return JSON.stringify({
    last: row.name_last || '',
    first: row.name_first || '',
    business: row.name_business || '',
  })
}

const getInternetJson = (row: any) => {
  return JSON.stringify({
    web: row.website || '',
    email: row.email || '',
  })
}

const getOtherJson = (row: any) => {
  return JSON.stringify({
    comments: row.comments || '',
    credentials: row.credentials || '',
    topic: row.topic || '',
    bar_assoc_num: row.bar_assoc_num || '',
    specialty: row.specialty || '',
    talk_about: row.talk_about || '',
    cv: row.cv || '',
  })
}
const mapCSVRow = (row: any, fieldNames: string[]) => {
  const mappedRow = {};
  fieldNames.forEach((element, idx) => {
    //@ts-ignore
    mappedRow[element] = pgCleanString(row[Object.keys(row)[idx]].trim());
  });
  const hydratedRow = {
    ...mappedRow,
    name_json: getNameJson(mappedRow),
    address_json: getAddrJson(mappedRow),
    phone_json: getPhoneJson(mappedRow),
    internet_json: getInternetJson(mappedRow),
    other_json: getOtherJson(mappedRow),
  }
  return hydratedRow;
}

export const mapCSVRows = (rows: any[], fieldNames: string[]) => {
  return rows.map((row: any) => {
    return mapCSVRow(row, fieldNames);
  })
}

export const readCSVFile = async (fileName: string) => {
  const rows: any[] = [];
  const fileStream = fs.createReadStream(fileName)
    .pipe(csv())
    .on('data', (row) => {
      rows.push(row);
    })

  return new Promise((resolve, reject) => {
    fileStream.on('end', () => {
      resolve(rows);
    });
    fileStream.on('error', (e) => {
      reject(e);
    })
  })
}

export const removeInvalidRows = (rows: any[]) => {
  return rows.filter((row) => {
    return (
      (row.name_last !== '' && row.name_last !== null)
      || (row.name_first !== '' && row.name_first !== null)
      || (row.name_business !== '' && row.name_business !== null)
    )
  });
}

export const loadToResourceTable = () => {
  const label = 'load csv rows into gis_resource';
  const params: string[] = [];
  const sql = `
      INSERT INTO app.gis_resource (id,
                                    name_json,
                                    address_json,
                                    phone_json,
                                    internet_json,
                                    other_json,
                                    description,
                                    lat,
                                    lng,
                                    shape,
                                    created_at,
                                    created_by,
                                    updated_at,
                                    updated_by)
          (SELECT id::UUID,
                  name_json::JSONB,
                  address_json::JSONB,
                  phone_json::JSONB,
                  internet_json::JSONB,
                  other_json::JSONB,
                  NULL,
                  lat::DOUBLE PRECISION,
                  lng::DOUBLE PRECISION,
                  NULL,
                  NOW(),
                  '00000000-0000-0000-0000-000000000000',
                  NOW(),
                  '00000000-0000-0000-0000-000000000000'
           FROM app.gis_resource_staging)
      RETURNING id;
  `;
  return pgQuery(sql, params, label);
}

const checkCategoryExists = async (category: string) => {
  const label = `check category ${category} exists`;
  const params = [category];
  const sql = `
    SELECT id FROM app.gis_category
    WHERE name = $1;
  `;
  const exists: any = await pgQuery(sql, params, label);
  logDebug({exists});
  if (exists.length > 0) {
    return exists[0].id;
  }
  return null;
}

export const createCategory = async (category: string) => {
  let categoryId = await checkCategoryExists(category);
  if (categoryId) {
    return categoryId;
  }
  const label = `create ${category} category`;
  const params = [category];
  const sql = `
    INSERT INTO app.gis_category (name, created_at, created_by, updated_at, updated_by)
    VALUES ($1, NOW(), '${nullUserId}', NOW(), '${nullUserId}')
    RETURNING id;
  `
  const created: any = await pgQuery(sql, params, label);
  logDebug(created);
  return created[0].id;
}

const getResourceIds = async () => {
  const label = 'get resource ids'
}
export const createCategoryReferences = async (
  categoryId: string,
  resourceIds: {id: string}[]
) => {
  const label = 'create references to category';
  const params = [categoryId];
  const values = resourceIds.map((resourceObj:{id: string}) => {
    const resourceId = resourceObj.id;
    return `('${resourceId}', $1, NOW(), '${nullUserId}', NOW(), '${nullUserId}')`;
  })
  const sql = `
    INSERT INTO app.gis_resource_x_category (
      resource_id, 
      category_id,
      created_at,
      created_by,
      updated_at,
      updated_by
    )
    VALUES ${values.join(',')};
  `;
  return pgQuery(sql, params, label);
}
