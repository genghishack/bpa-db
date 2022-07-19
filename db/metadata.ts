import {app} from "./app.js";

(async () => {
  try {
    await app('metadata');
  } catch (e) {
    log.error(e);
  }
})()
