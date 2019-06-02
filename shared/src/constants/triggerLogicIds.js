import convertObjectToArray from 'utilities.shared/convertObjectToArray';

/**
 * @typedef {String} TriggerLogicId
 */
export const TRIGGER_LOGIC_ID = {
  ADD: 'TRIGGER_LOGIC_ID.ADD',
  SUBTRACT: 'TRIGGER_LOGIC_ID.SUBTRACT',

  GIVE: 'TRIGGER_LOGIC_ID.GIVE',
  TAKE: 'TRIGGER_LOGIC_ID.TAKE',

  MOVE: 'TRIGGER_LOGIC_ID.MOVE',
};
/** @type {Array<TriggerLogicId>} */
export const TRIGGER_LOGIC_ID_LIST = convertObjectToArray(TRIGGER_LOGIC_ID);
/**
 * list of all triggers that utilize a Point
 */
export const ITEM_TRIGGER_LOGIC_ID_LIST = [
  TRIGGER_LOGIC_ID.GIVE,
  TRIGGER_LOGIC_ID.TAKE,
];
/**
 * list of all triggers that utilize a Number
 */
export const NUMBER_TRIGGER_LOGIC_ID_LIST = [
  TRIGGER_LOGIC_ID.ADD,
  TRIGGER_LOGIC_ID.SUBTRACT,
];
/**
 * list of all triggers that utilize a Number
 */
export const STAT_TRIGGER_LOGIC_ID_LIST = [
  TRIGGER_LOGIC_ID.ADD,
  TRIGGER_LOGIC_ID.SUBTRACT,
];
/**
 * list of all triggers that add something
 */
export const ADD_TRIGGER_LOGIC_ID_LIST = [
  TRIGGER_LOGIC_ID.ADD,
  TRIGGER_LOGIC_ID.GIVE,
];
/**
 * list of all triggers that subtract something
 */
export const SUBTRACT_TRIGGER_LOGIC_ID_LIST = [
  TRIGGER_LOGIC_ID.SUBTRACT,
  TRIGGER_LOGIC_ID.TAKE,
];
/**
 * list of all triggers that utilize a Point
 */
export const POINT_TRIGGER_LOGIC_ID_LIST = [
  TRIGGER_LOGIC_ID.MOVE,
];
