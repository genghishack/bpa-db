const seq = 201;
const label = 'create RBAC views';

export default {
  seq, label, sql: `
    DROP TABLE IF EXISTS app.v_auth_permission;
    CREATE VIEW app.v_auth_permission AS
      SELECT 
        p.id, 
        ast.name || ':' || act.name AS name,
        ast.id AS asset_id,
        act.id AS action_id,
        ast.name AS asset_name,
        act.name AS action_name
      FROM app.auth_permission p
      LEFT JOIN app.auth_asset ast ON (p.asset_id = ast.id)
      LEFT JOIN app.auth_action act ON (p.action_id = act.id);

    DROP TABLE IF EXISTS app.v_auth_role_permission;
    CREATE VIEW app.v_auth_role_permission AS
      WITH named_permissions AS (
        SELECT *
        FROM app.v_auth_permission
      )
      SELECT
        rp.id,
        r.name AS role_name,
        p.name AS permission_name,
        r.id AS role_id,
        p.id AS permission_id
      FROM app.auth_role_permission rp
      LEFT JOIN app.auth_role r ON (rp.role_id = r.id)
      LEFT JOIN named_permissions p ON (rp.permission_id = p.id);
  `
};
