import Logger from "bunyan";
import dotenv from 'dotenv';
import bunyan from "bunyan";
import {EtlStages, LayerOptions, LoaderOptions, UserOptions} from "./types/etl.js";
import {MigrateUserOptions} from "./types/migrate.js";

dotenv.config();

declare global {
  var appName: string;
  var logParent: Logger;
  var log: Logger;
  var etlStages: EtlStages;
  var userOpts: UserOptions;
  var migrateUserOpts: MigrateUserOptions;
  var loaderOpts: LoaderOptions;
  var layerOpts: LayerOptions;
  var multiState: boolean;
}

export const logger = (appName: string, src: boolean = false) => {
  return bunyan.createLogger({
    name: appName,
    src,
    serializers: bunyan.stdSerializers,
    streams: [
      {
        level: "info",
        stream: process.stdout,
      },
      {
        level: "debug",
        type: 'file',
        path: `${process.env.LOG_PATH}/${appName}.log`,
        period: '1d',
        count: 5,
      }
    ]
  });
}
