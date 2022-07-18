const seq = 1.213;
const label = 'create load_staged_data functions';

export default {
  seq, label, sql: `
    -- This one must be created first
    CREATE OR REPLACE FUNCTION "layer_mgt"."load_staged_data" (param_base_schema text, param_staging_table text, param_target_table text, param_primary_key text, param_columns_exclude text[])  RETURNS integer
      VOLATILE
    AS $body$
    DECLARE
      var_sql text;
      var_staging_schema text; 
      var_data_schema text;
      var_temp text;
      var_num_records bigint;
    BEGIN
    -- Add all the fields except geoid and gid
    -- Assume all the columns are in same order as target
    SELECT staging_schema, data_schema 
    INTO var_staging_schema, var_data_schema 
    FROM layer_mgt.layer_config_schema 
    WHERE base_schema = param_base_schema;
    var_sql := 'INSERT INTO ' || var_data_schema || '.' || quote_ident(param_target_table) || '(' ||
                  array_to_string(ARRAY(SELECT quote_ident(column_name::text)
                  FROM information_schema.columns
                  WHERE table_name = param_target_table
                  AND table_schema = var_data_schema
                  AND column_name <> ALL(param_columns_exclude)
                  ORDER BY column_name ), ',') || ') SELECT '
                  || array_to_string(ARRAY(SELECT quote_ident(column_name::text)
                  FROM information_schema.columns
                  WHERE table_name = param_staging_table
                  AND table_schema = var_staging_schema
                  AND column_name <> ALL( param_columns_exclude)
                  ORDER BY column_name ), ',') ||' FROM '
                  || var_staging_schema || '.' || param_staging_table ||
                  ' ON CONFLICT(' || param_primary_key || ') DO NOTHING;';
    RAISE NOTICE '%', var_sql;
    EXECUTE (var_sql);
    GET DIAGNOSTICS var_num_records = ROW_COUNT;
    --SELECT DropGeometryTable(var_staging_schema,param_staging_table) 
    --INTO var_temp;
    RETURN var_num_records;
    END;
    $body$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION "layer_mgt"."load_staged_data" (param_base_schema text, param_staging_table text, param_primary_key text, param_target_table text)  RETURNS integer
      VOLATILE
    AS $body$
    -- exclude this set list of columns if no exclusion list is specified
    SELECT layer_mgt.load_staged_data($1, $2, $3, $4, (SELECT COALESCE(columns_exclude,ARRAY[
        'gid', 'geoid','cpi','suffix1ce', 'statefp00', 'statefp10', 'countyfp00','countyfp10'
       ,'tractce00', 'tractce10', 'blkgrpce00', 'blkgrpce10', 'blockce00', 'blockce10'
       ,'cousubfp00', 'submcdfp00', 'conctyfp00', 'placefp00', 'aiannhfp00', 'aiannhce00'
       ,'comptyp00', 'trsubfp00', 'trsubce00', 'anrcfp00', 'elsdlea00', 'scsdlea00'
       ,'unsdlea00', 'uace00', 'cd108fp', 'sldust00', 'sldlst00', 'vtdst00', 'zcta5ce00'
       ,'tazce00', 'ugace00', 'puma5ce00','vtdst10','tazce10','uace10','puma5ce10','tazce'
       ,'uace', 'vtdst', 'zcta5ce', 'zcta5ce10', 'puma5ce', 'ugace10','pumace10'
       ,'estatefp', 'ugace', 'blockce', 'shape_invalid'
   ]) FROM layer_mgt.layer_config_table WHERE $1 LIKE '%' || schema_name AND $3 LIKE '%' || table_name))
   $body$ LANGUAGE sql;
  `
}
