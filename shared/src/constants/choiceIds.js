import convertObjectToArray from 'utilities.shared/convertObjectToArray';

/**
 * @typedef {String} ChoiceId
 */
export const CHOICE_ID = {
  CONFIRM: 'CHOICE_ID.CONFIRM',
  GOTO: 'CHOICE_ID.GOTO',
  TRICK: 'CHOICE_ID.TRICK',
  TREAT: 'CHOICE_ID.TREAT',
};
/** @type {ChoiceId} */
export const CHOICE_ID_LIST = convertObjectToArray(CHOICE_ID);
/** @type {Array<ChoiceId} */
export const GOTO_CHOICE_ID_LIST = [
  CHOICE_ID.GOTO,
  CHOICE_ID.TRICK,
  CHOICE_ID.TREAT,
];
