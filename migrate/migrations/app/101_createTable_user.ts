const seq = 101;
const label = 'create user table';

export default {
  seq, label, sql: `
    DROP TABLE IF EXISTS app.user;
    CREATE TABLE app.user
    (
        id UUID NOT NULL,
        federated_id TEXT NOT NULL,
        email TEXT NOT NULL,
        name TEXT,
        roles JSONB NOT NULL,
        created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
        created_by UUID NOT NULL,
        updated_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
        updated_by UUID NOT NULL,
        PRIMARY KEY (id)
    );
  `
};
