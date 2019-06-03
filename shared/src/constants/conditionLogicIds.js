import convertObjectToArray from 'utilities.shared/convertObjectToArray';

/**
 * @typedef {String} ConditionLogicId
 */
export const CONDITION_LOGIC_ID = {
  EQUALS: 'CONDITION_LOGIC_ID.EQUALS',
  LESS_THAN: 'CONDITION_LOGIC_ID.LESS_THAN',
  GREATER_THAN: 'CONDITION_LOGIC_ID.GREATER_THAN',

  HAS_ITEM: 'CONDITION_LOGIC_ID.HAS_ITEM',
  DOES_NOT_HAVE_ITEM: 'CONDITION_LOGIC_ID.DOES_NOT_HAVE_ITEM',
};
/** @type {Array<ConditionLogicId>} */
export const CONDITION_LOGIC_ID_LIST = convertObjectToArray(CONDITION_LOGIC_ID);
/**
 * list of all triggers that utilize an "itemId" property
 */
export const ITEM_CONDITION_LOGIC_ID_LIST = [
  CONDITION_LOGIC_ID.HAS_ITEM,
  CONDITION_LOGIC_ID.DOES_NOT_HAVE_ITEM,
];
/**
 * list of all triggers that utilize the numerical "value" property
 */
export const NUMBER_CONDITION_LOGIC_ID_LIST = [
  CONDITION_LOGIC_ID.EQUALS,
  CONDITION_LOGIC_ID.LESS_THAN,
  CONDITION_LOGIC_ID.GREATER_THAN,
];
/**
 * list of all triggers that utilize a "location" property
 */
export const POINT_CONDITION_LOGIC_ID_LIST = [
];
/**
 * list of all triggers that utilize a "tileType" property
 */
export const TILETYPE_CONDITION_LOGIC_ID_LIST = [
];
