import {getDateStamp} from "../lib/utils.js";
import {logger} from "../startup.js";
import {StateInfo} from "../types/general.js";
import {processState} from "./lib/iterate.js";
import {getLoaderOptions, handleStateOption, readUserOptions} from "./options/general.js";

export const app = async (appName: string) => {
  globalThis.appName = appName;

  globalThis.logParent = logger(`${getDateStamp()}_${appName}`);
  globalThis.log = logParent.child({module: 'unknown', state: 'unknown'});

  try {
    globalThis.userOpts = await readUserOptions();
    globalThis.log = logParent.child({module: userOpts.module, state: 'unknown'});
    // log.info({userOpts});

    await import(`./modules/${userOpts.module}/common/settings.js`);
    const callback = await import(`./modules/${userOpts.module}/${appName}.js`);

    await handleStateOption(async (stateInfo: StateInfo) => {
      globalThis.loaderOpts = await getLoaderOptions(stateInfo);
      globalThis.log = logParent.child({module: userOpts.module, state: loaderOpts.state.abbrev})
      // log.debug({loaderOpts});

      await processState(callback.default);
    });

  } catch (e) {
    return Promise.reject(e);
  }
}
