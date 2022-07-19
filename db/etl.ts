import {app} from "./app.js";

(async () => {
  try {
    await app('etl');
  } catch (e) {
    log.error(e);
  }
})()
