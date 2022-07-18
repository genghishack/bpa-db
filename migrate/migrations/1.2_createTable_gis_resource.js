const tableConfig = require('../../lib/tableConfig.json');

const {gisResource: {main: tableName}} = tableConfig;

module.exports = {
  seq: 1.2,
  label: 'create GIS Resource table',
  sql: `
    DROP TABLE IF EXISTS ${tableName};
    CREATE TABLE ${tableName}
    (
        id UUID DEFAULT uuid_generate_v1(),
        name TEXT,
        business_name TEXT,
        website TEXT,
        email TEXT,
        phone TEXT,
        fax TEXT,
        description TEXT,
        address_json JSONB NOT NULL,
        latlng FLOAT[2] NOT NULL,
        approved_for_public BOOLEAN DEFAULT false,
        submitted_for_approval BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_by UUID NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
        updated_by UUID NOT NULL,
        PRIMARY KEY (id)
    );
  `
};
