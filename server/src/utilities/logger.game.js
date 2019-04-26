
/**
 * @typedef {String} LogType
 */
export const LOG_TYPES = {
  SERVER: 'SERVER-LOG-TYPE',
  LIFECYCLE: 'LIFECYCLE-LOG-TYPE',
  GAME: 'GAME-LOG-TYPE',

  NEW: 'NEW-LOG-TYPE',
  OLD: 'OLD-LOG-TYPE',

  ERROR: 'ERROR-LOG-TYPE',
  WARNING: 'WARNING-LOG-TYPE',
  VERBOSE: 'VERBOSE-LOG-TYPE',
};
/**
 * @link https://en.wikipedia.org/wiki/ANSI_escape_code#Colors
 */
const LOGGING_STYLES = {
  [LOG_TYPES.SERVER]: '\x1b[96m', // bright cyan
  [LOG_TYPES.LIFECYCLE]: '\x1b[36m', // cyan
  [LOG_TYPES.GAME]: '\x1b[93m', // bright yellow

  [LOG_TYPES.NEW]: '\x1b[92m', // bright green
  [LOG_TYPES.OLD]: '\x1b[32m', // green

  [LOG_TYPES.ERROR]: '\x1b[91m', // bright red
  [LOG_TYPES.WARNING]: '\x1b[33m', // yellow
  [LOG_TYPES.VERBOSE]: '\x1b[35m', // magenta
};
/**
 * @param {LogType} logType
 * @param {...*} - console.log stuff
 */
export function log(logType, ...args) {
  const logStyle = LOGGING_STYLES[logType];
  console.log(logStyle, ...args);
}
/**
 *
 */
export default {
  server: (...args) => {
    log(LOG_TYPES.SERVER, ...args);
  },

  lifecycle: (...args) => {
    log(LOG_TYPES.LIFECYCLE, ...args);
  },

  game: (...args) => {
    log(LOG_TYPES.GAME, ...args);
  },

  new: (...args) => {
    log(LOG_TYPES.NEW, ...args);
  },

  old: (...args) => {
    log(LOG_TYPES.OLD, ...args);
  },

  error: (...args) => {
    log(LOG_TYPES.ERROR, ...args);
  },

  warning: (...args) => {
    log(LOG_TYPES.WARNING, ...args);
  },

  verbose: (...args) => {
    log(LOG_TYPES.VERBOSE, ...args);
  },
};
