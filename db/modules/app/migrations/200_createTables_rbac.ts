const seq = 200;
const label = 'create RBAC tables';

export default {
  seq, label, sql: `
    DROP TABLE IF EXISTS app.auth_action CASCADE;
    CREATE TABLE app.auth_action(
      id UUID DEFAULT public.uuid_generate_v1(),
      name CHARACTER VARYING(50),
      PRIMARY KEY(id)
    );
    
    DROP TABLE IF EXISTS app.auth_asset CASCADE;
    CREATE TABLE app.auth_asset(
      id UUID DEFAULT public.uuid_generate_v1(),
      name CHARACTER VARYING(50),
      PRIMARY KEY(id)
    );
    
    DROP TABLE IF EXISTS app.auth_permission CASCADE;
    CREATE TABLE app.auth_permission(
      id UUID DEFAULT public.uuid_generate_v1(),
      asset_id UUID,
      action_id UUID,
      PRIMARY KEY(id),
      UNIQUE(asset_id,action_id),
      CONSTRAINT fk_auth_asset
        FOREIGN KEY(asset_id)
          REFERENCES app.auth_asset(id)
          ON DELETE CASCADE,
      CONSTRAINT fk_auth_action
        FOREIGN KEY(action_id)
          REFERENCES app.auth_action(id)
          ON DELETE CASCADE
    );
    DROP TABLE IF EXISTS app.auth_role CASCADE;
    CREATE TABLE app.auth_role(
      id UUID DEFAULT public.uuid_generate_v1(),
      name CHARACTER VARYING(50),
      PRIMARY KEY(id)
    );
    INSERT INTO app.auth_role(name)
    VALUES ('admin'),('user'),('contributor'),('guest');
    
    DROP TABLE IF EXISTS app.auth_role_permission CASCADE;
    CREATE TABLE app.auth_role_permission(
      id UUID DEFAULT public.uuid_generate_v1(),
      role_id UUID,
      permission_id UUID,
      PRIMARY KEY(role_id,permission_id),
      CONSTRAINT fk_auth_role
        FOREIGN KEY(role_id)
          REFERENCES app.auth_role(id)
          ON DELETE CASCADE,
      CONSTRAINT fk_auth_permission
        FOREIGN KEY(permission_id)
          REFERENCES app.auth_permission(id)
          ON DELETE CASCADE
    );
    
    DROP TABLE IF EXISTS app.auth_user_role CASCADE;
    CREATE TABLE app.auth_user_role(
      user_id UUID,
      role_id UUID,
      PRIMARY KEY(user_id,role_id),
      CONSTRAINT fk_auth_user
        FOREIGN KEY(user_id)
          REFERENCES app.user(id)
          ON DELETE CASCADE,
      CONSTRAINT fk_auth_role
        FOREIGN KEY(role_id)
          REFERENCES app.auth_role(id)
          ON DELETE CASCADE
    );
  `
};
