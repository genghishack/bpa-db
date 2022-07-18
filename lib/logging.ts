import util from 'util';

const { STAGE: stage } = process.env;

export const logError = (error: Error) => {
  console.error('Error: ', error.message, '\n\nStack: ', error.stack);
}

export function logDebug(a: any, b: any = null, c: any = null, d: any = null, e: any = null) {
  if (process.env.LOG_DEBUG === 'true' && stage !== 'prod') {
    const debugArgs = ['Debug: '];
    [...arguments].forEach(arg => {
      if (typeof arg === 'string') {
        arg = arg
          .replace(/\r?\n|\r/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
      debugArgs.push(util.inspect(arg, {depth: null}));
    })
    // console.log('debug: ', util.inspect(...arguments, {depth: null}));
    //@ts-ignore
    console.log.apply(console, debugArgs);
  }
}
