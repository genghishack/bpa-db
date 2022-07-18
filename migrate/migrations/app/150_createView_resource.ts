const seq = 150;
const label = 'create resource view';

const sql = `
DROP VIEW IF EXISTS app.v_gis_resource;
CREATE VIEW app.v_gis_resource AS (
  SELECT r.id,
       r.status_id,
       (SELECT to_json(sj) 
        FROM (
         SELECT *
         FROM app.gis_resource_status s
         WHERE s.id = r.status_id
        ) sj
       ) AS status_json,
       (SELECT json_agg(cj)
        FROM (
         SELECT c.id
         FROM app.gis_category c
         LEFT JOIN app.gis_resource_x_category rxc ON (rxc.category_id = c.id)
         WHERE rxc.resource_id = r.id
        ) cj
       ) AS category_json,
       r.name_json,
       r.address_json,
       r.phone_json,
       r.internet_json,
       r.other_json,
       r.description,
       r.lat,
       r.lng,
       r.shape,
       r.created_at,
       r.created_by,
       r.updated_at, 
       r.updated_by
  FROM app.gis_resource r
);`;

export default {seq, label, sql};
