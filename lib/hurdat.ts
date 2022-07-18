import readline from "readline";
import fs from "fs";
import {getTmpDir} from "./filesystem.js";
import {pgQuery} from "./postgres.js";
import {LayerOptions} from "../types/etl.js";
import {HurdatFileRow} from "../types/hurdat.js";

export const parseHurdatFile = async (opts: LayerOptions) => {
  const tmpDir = await getTmpDir(opts.module);
  const fileName = opts.layer.dir;
  const hurdatRows: HurdatFileRow[] = [];
  let storm_id: string = '';
  let storm_name: string = '';
  let num_rows: number = 0;
  let i: number = 0;

  return new Promise<HurdatFileRow[]>((resolve, reject) => {
    readline.createInterface({
      input: fs.createReadStream(`${tmpDir}/${fileName}`)
    }).on('line', async (line) => {
      if (line.length === 37) {
        i = 0;
        const heading = line.split(',');
        storm_id = heading[0].trim();
        storm_name = heading[1].trim();
        num_rows = parseInt(heading[2].trim(), 10);
      } else if (line.length > 37) {
        i++;
        if (i <= num_rows) {
          const data = line.split(',');

          hurdatRows.push({
            storm_id,
            storm_name,
            meas_ymd: data[0].trim(),
            meas_hm: data[1].trim(),
            rec_identifier: data[2].trim(),
            storm_status: data[3].trim(),
            lat_rel: data[4].trim(),
            lng_rel: data[5].trim(),
            msw_kt: parseInt(data[6].trim(), 10),
            mcb_mb: parseInt(data[7].trim(), 10),
            ne_34: parseInt(data[8].trim(), 10),
            se_34: parseInt(data[9].trim(), 10),
            sw_34: parseInt(data[10].trim(), 10),
            nw_34: parseInt(data[11].trim(), 10),
            ne_50: parseInt(data[12].trim(), 10),
            se_50: parseInt(data[13].trim(), 10),
            sw_50: parseInt(data[14].trim(), 10),
            nw_50: parseInt(data[15].trim(), 10),
            ne_64: parseInt(data[16].trim(), 10),
            se_64: parseInt(data[17].trim(), 10),
            sw_64: parseInt(data[18].trim(), 10),
            nw_64: parseInt(data[19].trim(), 10),
          });
        }

      }
    }).on('close', () => {
      resolve(hurdatRows);
    })
  });
}

export const insertHurdatRows = async (
  opts: LayerOptions,
  hurdatRows: HurdatFileRow[]
) => {
  const label = 'insert hurdat rows';
  const rValues: string[] = [];
  hurdatRows.forEach((row: HurdatFileRow) => {
    const {
      storm_id, storm_name, meas_ymd, meas_hm, rec_identifier, storm_status,
      lat_rel, lng_rel, msw_kt, mcb_mb, ne_34, se_34, sw_34, nw_34,
      ne_50, se_50, sw_50, nw_50, ne_64, se_64, sw_64, nw_64,
    } = row;

    const lat_deg = parseFloat(lat_rel.slice(0, -1));
    const lat_hs = lat_rel.slice(-1);
    const lat = (lat_hs === 'N' ? lat_deg : 0 - lat_deg);

    const lng_deg = parseFloat(lng_rel.slice(0, -1));
    const lng_hs = lng_rel.slice(-1);
    const lng = (lng_hs === 'E' ? lng_deg : 0 - lng_deg);

    const shape_wkt = `POINT (${lng} ${lat})`;

    rValues.push(`
      (
        '${storm_id}',
        '${storm_name}',
        '${storm_id.slice(0, 2)}', -- storm_basin
        '${storm_id.slice(2, 4)}', -- cyclone_num
        '${storm_id.slice(4)}',    -- storm_year
        '${meas_ymd}',
        '${meas_hm}',
        '${meas_ymd.slice(0, 4)}', -- meas_year
        '${meas_ymd.slice(4, 6)}', -- meas_month
        '${meas_ymd.slice(6)}',    -- meas_day
        '${meas_hm.slice(0, 2)}',  -- meas_hour
        '${meas_hm.slice(2)}',     -- meas_minute
        '${rec_identifier}',
        '${storm_status}',
        ${lat},
        ${lng},
        ${msw_kt},
        ${mcb_mb},
        ${ne_34},
        ${se_34},
        ${sw_34},
        ${nw_34},
        ${ne_50},
        ${se_50},
        ${sw_50},
        ${nw_50},
        ${ne_64},
        ${se_64},
        ${sw_64},
        ${nw_64},
        '${shape_wkt}',
        ST_PointFromText('${shape_wkt}', 4326)
      )
    `);
  })

  const sql = `
      INSERT INTO ${opts.schema.data}.${opts.layer.table} 
          (storm_id, storm_name,
          storm_basin, cyclone_num, storm_year,
          meas_ymd, meas_hm,
          meas_year, meas_month, meas_day, meas_hour, meas_minute,
          rec_identifier, storm_status,
          lat, lng,
          msw_kt, mcb_mb,
          ne_34, se_34, sw_34, nw_34,
          ne_50, se_50, sw_50, nw_50,
          ne_64, se_64, sw_64, nw_64,
          shape_wkt, shape)
      VALUES ${rValues.join(',')}
  `;
  try {
    await pgQuery(sql, [], label);
  } catch (e) {
    console.log(e);
  }

}
