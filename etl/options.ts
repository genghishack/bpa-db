import {logDebug} from "../lib/logging.js";
import {getLoaderConfigForSchema, getStateInfoFromAbbrev} from "../lib/sql.js";
import {LoaderOptions, SchemaConfig, UserOptions} from "../types/etl.js";

export const readUserOptions = async () => {
  const {argv: opts} = process;
  let module, layer, offset;
  let state = 'us';

  try {
    const moduleIndex = opts.indexOf('-m');
    if (moduleIndex > -1) {
      module = opts[moduleIndex + 1].toLowerCase();
      // TODO: check for valid source name (alphanumeric string only)
    } else {
      return Promise.reject(new Error('no -m (module) option present'));
    }

    const stateIndex = opts.indexOf('-s');
    if (stateIndex > -1) {
      state = opts[stateIndex + 1].toLowerCase();
      // TODO: check against regex for state
    }

    const layerIndex = opts.indexOf('-l');
    if (layerIndex > -1) {
      layer = opts[layerIndex + 1].toLowerCase();
    }

    // TODO: fix this option - doesn't work
    const offsetIndex = opts.indexOf('-o');
    if (offsetIndex > -1) {
      offset = parseInt(opts[offsetIndex + 1]);
    }

    const validate = (opts.includes('-v'));

    const force = (opts.includes('-f'));

    // logDebug({module, state, layer, offset, validate, force});

    return<UserOptions> {
      module,
      state,
      layer,
      offset,
      validate,
      force
    };
  } catch (e) {
    return Promise.reject(e)
  }
}

export const getLoaderOptions = async (
  userOpts: UserOptions,
  baseSchema: string
) => {
  try {
    // Get the basic information for connection and load
    const result = await getLoaderConfigForSchema(baseSchema);
    const schemaConfig: SchemaConfig = result[0];
    const stateInfo = await getStateInfoFromAbbrev(userOpts.state);

    return<LoaderOptions> {
      module: userOpts.module,
      user: userOpts,
      schema: {
        base: schemaConfig.base_schema,
        data: schemaConfig.data_schema,
        staging: schemaConfig.staging_schema,
      },
      source: {
        web: schemaConfig.web_root,
        ftp: schemaConfig.ftp_root,
        // TODO: this used to default to ftp, if present, before switching to
        //  a FEMA network where FTP is not allowed.  Logic has been commented
        url: schemaConfig.web_root, // schemaConfig.ftp_root ? `ftp://${schemaConfig.ftp_root}` : schemaConfig.web_root,
        path: schemaConfig.base_path,
      },
      state: {
        abbrev: stateInfo.abbrev,
        name: stateInfo.name,
        fips: stateInfo.fips,
      },
    }
  } catch (e) {
    return Promise.reject(e);
  }
}
