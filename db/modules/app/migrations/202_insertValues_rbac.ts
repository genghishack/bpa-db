const seq = 202;
const label = 'insert initial RBAC values';

export default {
  seq, label, sql: `
    INSERT INTO app.auth_action(name)
    VALUES ('create'),('view'),('list'),('edit'),('delete');

    INSERT INTO app.auth_asset(name)
    VALUES ('user'),('user_mgt'),('user_profile'),('self_profile');

    INSERT INTO app.auth_permission (asset_id, action_id)
    VALUES (
      (SELECT id FROM app.auth_asset WHERE name = 'self_profile'),
      (SELECT id FROM app.auth_action WHERE name = 'view')
    ),(
      (SELECT id FROM app.auth_asset WHERE name = 'self_profile'),
      (SELECT id FROM app.auth_action WHERE name = 'edit')
    ),(
      (SELECT id FROM app.auth_asset WHERE name = 'user'),
      (SELECT id FROM app.auth_action WHERE name = 'list')
    ),(
      (SELECT id FROM app.auth_asset WHERE name = 'user'),
      (SELECT id FROM app.auth_action WHERE name = 'view')
    ),(
      (SELECT id FROM app.auth_asset WHERE name = 'user'),
      (SELECT id FROM app.auth_action WHERE name = 'create')
    ),(
      (SELECT id FROM app.auth_asset WHERE name = 'user'),
      (SELECT id FROM app.auth_action WHERE name = 'edit')
    ),(
      (SELECT id FROM app.auth_asset WHERE name = 'user'),
      (SELECT id FROM app.auth_action WHERE name = 'delete')
    );
    
    WITH named_permissions AS (
      SELECT *
      FROM app.v_auth_permission
    )
    INSERT INTO app.auth_role_permission (role_id, permission_id)
    VALUES (
      (SELECT id FROM app.auth_role WHERE name = 'user'),
      (SELECT id FROM named_permissions WHERE asset_name = 'self_profile' AND action_name = 'view')
    ),(
      (SELECT id FROM app.auth_role WHERE name = 'user'),
      (SELECT id FROM named_permissions WHERE asset_name = 'self_profile' AND action_name = 'edit')
    ),(
      (SELECT id FROM app.auth_role WHERE name = 'admin'),
      (SELECT id FROM named_permissions WHERE asset_name = 'user' AND action_name = 'create')
    ),(
      (SELECT id FROM app.auth_role WHERE name = 'admin'),
      (SELECT id FROM named_permissions WHERE asset_name = 'user' AND action_name = 'view')
    ),(
      (SELECT id FROM app.auth_role WHERE name = 'admin'),
      (SELECT id FROM named_permissions WHERE asset_name = 'user' AND action_name = 'list')
    ),(
      (SELECT id FROM app.auth_role WHERE name = 'admin'),
      (SELECT id FROM named_permissions WHERE asset_name = 'user' AND action_name = 'edit')
    ),(
      (SELECT id FROM app.auth_role WHERE name = 'admin'),
      (SELECT id FROM named_permissions WHERE asset_name = 'user' AND action_name = 'delete')
    );
  `
};
