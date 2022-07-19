import {StateInfo} from "../../types/general.js";
import {runConsecutively} from "../lib/iterate.js";
import {getLoaderConfigForSchema, getStateInfoFromAbbrev, listStates} from "../sql/general.js";
import {LoaderOptions, SchemaConfig, UserOptions} from "../../types/etl.js";

export const readUserOptions = async () => {
  const {argv: opts} = process;
  let module, layer, state;

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

    const force = (opts.includes('-f'));

    const mock = (opts.includes('-k'));

    log.debug({module, state, layer, force, mock});

    return<UserOptions> {
      module,
      state,
      layer,
      force,
      mock,
    };
  } catch (e) {
    return Promise.reject(e);
  }
}

export const getLoaderOptionsObj = (
  schemaConfig: SchemaConfig,
  stateInfo: StateInfo,
) => {
  log.info({
    state: stateInfo.abbrev,
    fips: stateInfo.fips,
    schema: schemaConfig.base_schema,
  })
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
}

export const getLoaderOptions = async (
  stateInfo: StateInfo,
) => {
  const baseSchema = userOpts.module;
  try {
    const schemaResult = await getLoaderConfigForSchema(baseSchema);
    const schemaConfig: SchemaConfig = schemaResult[0];
    // log.debug({schemaConfig, stateInfo});

    if (!schemaConfig) {
      throw new Error('Migrations have not been run for this module');
    }
    return getLoaderOptionsObj(schemaConfig, stateInfo);
  } catch (e) {
    return Promise.reject(e);
  }
}

export const handleStateOption = async (
  callback: Function,
) => {
  if (globalThis.multiState === false) {
    userOpts.state = 'us';
  }

  if (!userOpts.state) {
    const states = await listStates()
    // log.debug({states});

    await runConsecutively(states, async (stateInfo: StateInfo) => {
      await callback(stateInfo);
    })
  } else {

    const stateInfo = await getStateInfoFromAbbrev(userOpts.state);
    callback(stateInfo);

  }
}