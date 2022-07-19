import {pgQuery} from "../../lib/postgres.js";

export const listStatesFromCensus = async () => {
  log.info('Getting list of states from census...');
  const label = 'get list of states from census';
  const sql = `
      SELECT stusps  AS abbrev,
             statefp AS fips,
             name
      FROM census_2020.us_state
      ORDER BY statefp;
  `
  return pgQuery(sql, [], label);
}

export const getStateFromCensus = async (abbrev: string) => {
  log.info(`Getting ${abbrev} info from census...`);
  const label = `get ${abbrev} object from census`;
  const sql = `
      SELECT stusps  AS abbrev,
             statefp AS fips,
             name
      FROM census_2020.us_state
      WHERE stusps = '${abbrev}'
  `;
  return pgQuery(sql, [], label);
}
