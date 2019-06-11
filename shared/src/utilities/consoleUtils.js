import {STAT_ID} from 'constants.shared/statIds';

const CONSOLE_SINGULAR_LIST = [
  'restart',
];
const CONSOLE_ACTION_LIST = [
  'set',
  'give',
  'move',
];
const CONSOLE_TARGET_MAP = {
  health: STAT_ID.HEALTH,
  movement: STAT_ID.MOVEMENT,
  sanity: STAT_ID.SANITY,
  vision: STAT_ID.VISION,
  candies: STAT_ID.CANDIES,
  tricky: STAT_ID.TRICKY,
  treaty: STAT_ID.TREATY,
  luck: STAT_ID.LUCK,
  greed: STAT_ID.GREED,
};
/**
 * @param {String} consoleText
 * @returns {String}
 */
export function createConsoleData(consoleText) {
  const textParts = consoleText.split(' ');
  const consoleAction = textParts[0];
  const consoleTarget = textParts[1];
  const consoleValue = textParts[2];

  // single action
  if (CONSOLE_SINGULAR_LIST.includes(consoleAction)) {
    return {action: consoleAction};
  }

  // otherwise need all parts
  if (consoleAction === undefined || consoleTarget === undefined || consoleValue === undefined) {
    return null;
  }

  return {
    action: consoleAction,
    target: CONSOLE_TARGET_MAP[consoleTarget],
    value: consoleValue,
  }
}
