import convertObjectToArray from 'utilities.shared/convertObjectToArray';

/**
 * @typedef {String} ActionId
 */

export const ENCOUNTER_ACTION_ID = {
  CONFIRM: 'ENCOUNTER_ACTION_ID.CONFIRM',
  GOTO: 'ENCOUNTER_ACTION_ID.GOTO',
};
export const ENCOUNTER_ACTION_ID_LIST = convertObjectToArray(ENCOUNTER_ACTION_ID);
