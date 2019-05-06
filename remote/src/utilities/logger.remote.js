import remoteAppState from 'state/remoteAppState';

/**
 * this helps track things happening on the Remote
 */


/**
 * @typedef {String} LogType
 */
export const LOG_TYPES = {
  REMOTE: 'REMOTE-LOG-TYPE',
  SERVER: 'SERVER-LOG-TYPE',
  USER: 'USER-LOG-TYPE',
  ERROR: 'ERROR-LOG-TYPE',
};
/**
 * @param {LogType} logType
 * @param {...*} - console.log stuff
 */
export function log(logType, args) {
  const date = new Date();

  const logData = {
    data: args,
    logType: logType,
    logTime: date.getTime(),
    logDate: Date.now(),
  };

  remoteAppState.addToArray('appLog', logData);
}
/**
 * @param {Array<LogData>} logDataList
 * @returns {String}
 */
export function parseLogData(logDataList) {
  const stringgedLogList = logDataList.map((logDataItem) => (
    `[${logDataItem.logTime}]: ${logDataItem.data}`
  ));

  return stringgedLogList.join('\n');
}
/**
 *
 */
export default {
  remote: (...args) => {
    log(LOG_TYPES.REMOTE, ...args);
  },

  server: (...args) => {
    log(LOG_TYPES.SERVER, ...args);
  },

  user: (...args) => {
    log(LOG_TYPES.USER, ...args);
  },

  error: (...args) => {
    log(LOG_TYPES.ERROR, ...args);
  },
};
