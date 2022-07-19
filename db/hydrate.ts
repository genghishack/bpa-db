import {app} from "./app.js";

(async () => {
  try {
    await app('hydrate');
  } catch (e) {
    log.error(e);
  }
})()
