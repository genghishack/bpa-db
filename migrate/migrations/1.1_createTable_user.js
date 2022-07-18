const tableConfig = require('../../lib/tableConfig.json');

const {user: {main: tableName}} = tableConfig;

module.exports = {
  seq: 1.1,
  label: 'create User table',
  sql: `
    DROP TABLE IF EXISTS ${tableName};
    CREATE TABLE ${tableName}
    (
        id UUID NOT NULL,
        federated_id TEXT NOT NULL,
        email TEXT NOT NULL,
        name TEXT,
        roles JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_by UUID NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
        updated_by UUID NOT NULL,
        PRIMARY KEY (id)
    );
  `
};
