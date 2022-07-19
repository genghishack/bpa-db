const seq = 1.210;
const label = 'create steward table';

export default {
  seq, label, sql: `
        DROP TABLE IF EXISTS layer_mgt.steward CASCADE;
        CREATE TABLE layer_mgt.steward
        (
            id           UUID DEFAULT uuid_generate_v1(),
            steward_name TEXT UNIQUE NOT NULL,

            PRIMARY KEY (id)
        );

--         INSERT INTO layer_mgt.steward (steward_name)
--         VALUES ('USACE'),
--                ('Census'),
--                ('HiFLD/DHS'),
--                ('FID'),
--                ('ORNL/FEMA'),
--                ('PNNL'),
--                ('NOAA'),
--                ('NFHL'),
--                ('CERA'),
--                ('Microsoft'),
--                ('DHS/FEMA/Maxar'),
--                ('CoreLogic'),
--                ('FEMA/FIMA Risk Analysis Division'),
--                ('landscan.ornl.gov'),
--                ('Lightbox');
  `
}
