import dotenv from 'dotenv';
import {logDebug} from "./lib/logging.js";
import {getTableConfigForSchemaAndState, resetSchema,} from "./lib/sql.js";
import {resetDirs} from './lib/filesystem.js';
import {showTimeStamp} from "./lib/utils.js";
import {getLoaderOptions, readUserOptions} from "./etl/options.js";
import {UserOptions, LoaderOptions, LayerRecord} from './types/etl.js';

dotenv.config();

const etl = async () => {
  const userOpts: UserOptions = await readUserOptions();
  // console.log({userOpts});
  const baseSchema = userOpts.module;

  try {
    const {extractTransformLoad, etlStages} = await import(`./etl/modules/${userOpts.module}/main.js`);

    const loaderOpts: LoaderOptions = await getLoaderOptions(
      userOpts,
      baseSchema
    );

    const layers: LayerRecord[] = await getTableConfigForSchemaAndState(
      loaderOpts.schema.base,
      loaderOpts.state.abbrev,
      userOpts.layer,
    );

    logDebug({loaderOpts});
    logDebug({layers});
    showTimeStamp();

    if (etlStages.resetDirs) {
      // Empty the log and temp directories
      await resetDirs(loaderOpts.module);
    }

    if (etlStages.resetStagingSchema) {
      // Destroy and re-create the staging schema
      await resetSchema(loaderOpts.schema.staging);
    }

    // Run the module's ETL process
    await extractTransformLoad(loaderOpts, layers, etlStages);

  } catch (e) {
    return Promise.reject(e);
  }
}

(async () => {
  try {
    await etl();
  } catch (e) {
    console.error(e.message);
  }
})()
