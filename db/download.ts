import {app} from "./app.js";

(async () => {
  try {
    await app('download');
  } catch (e) {
    log.error(e);
  }
})()
