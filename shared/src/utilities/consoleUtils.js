import {STAT_ID} from 'constants.shared/statIds';

import * as statUtils from 'utilities.shared/statUtils';

// one-string actions
const CONSOLE_QUICK_ACTION_LIST = [
  'restart',
];
/**
 * @param {String} consoleText
 * @returns {Object}
 */
export function createConsoleData(consoleText) {
  const textParts = consoleText.split(' ');
  const consoleAction = textParts[0];

  // quick action
  if (CONSOLE_QUICK_ACTION_LIST.includes(consoleAction)) {
    return {action: consoleAction};
  }

  // move
  if (consoleAction === 'move') {
    return {
      action: consoleAction,
      value: textParts[1],
    }
  }

  // set - needs 3 parts
  return {
    action: consoleAction,
    statId: statUtils.convertStringToStat(textParts[1]),
    value: textParts[2],
  }
}
