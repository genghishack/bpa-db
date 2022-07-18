const tableConfig = require('./tableConfig.json');
const postgres = require('./postgres');

const {pgQuery} = postgres;
const {populate: {name: tableName_populate}} = tableConfig;

const emptyTable = async (tableName) => {
  await pgQuery(`
      TRUNCATE TABLE ${tableName};
    `);
  console.log(`${tableName} table emptied`);
};

const populateTable = async (tableName, sql) => {
  await emptyTable(tableName);
  const result = await pgQuery(sql);
  await updatePopulateTable(tableName);
  console.log(`${tableName} table populated (${result.rows.length} rows)`)
};

const updatePopulateTable = async (tableName) => {
  const rowExists = (await pgQuery(`
      SELECT * FROM ${tableName_populate}
      WHERE table_name = '${tableName}'
    `)).rows.length;

  if (rowExists) {
    await pgQuery(`
      UPDATE ${tableName_populate} SET updated_at = CURRENT_TIMESTAMP
      WHERE table_name = '${tableName}'
    `);
  } else {
    await pgQuery(`
      INSERT INTO ${tableName_populate} (
          table_name,
          updated_at
      )
      VALUES ( '${tableName}', CURRENT_TIMESTAMP )
    `);
  }
};

const tableMaintenance = {emptyTable, populateTable, updatePopulateTable};

module.exports = tableMaintenance;
