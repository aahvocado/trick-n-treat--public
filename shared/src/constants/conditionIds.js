import convertObjectToArray from 'utilities.shared/convertObjectToArray';

/**
 * @typedef {String} ConditionId
 */
export const CONDITION_ID = {
  EQUALS: 'CONDITION_ID.EQUALS',
  LESS_THAN: 'CONDITION_ID.LESS_THAN',
  GREATER_THAN: 'CONDITION_ID.GREATER_THAN',

  AT_LOCATION: 'CONDITION_ID.AT_LOCATION',

  ON_TILE_TYPE: 'CONDITION_ID.ON_TILE_TYPE',

  HAS_ITEM: 'CONDITION_ID.HAS_ITEM',
};
export const CONDITION_ID_LIST = convertObjectToArray(CONDITION_ID);
/**
 * list of all triggers that utilize an Item
 */
export const ITEM_CONDITION_ID_LIST = [
  CONDITION_ID.HAS_ITEM,
];
/**
 * list of all triggers that utilize a Number
 */
export const NUMBER_CONDITION_ID_LIST = [
  CONDITION_ID.EQUALS,
  CONDITION_ID.LESS_THAN,
  CONDITION_ID.GREATER_THAN,
];
/**
 * list of all triggers that utilize a Point
 */
export const POINT_CONDITION_ID_LIST = [
  CONDITION_ID.AT_LOCATION,
];
/**
 * list of all triggers that utilize a TileType
 */
export const TILETYPE_CONDITION_ID_LIST = [
  CONDITION_ID.ON_TILE_TYPE,
];
/**
 * @typedef {String} ConditionTargetId
 */
export const CONDITION_TARGET_ID = {
  STAT: {
    HEALTH: 'CONDITION_TARGET_ID.STAT.HEALTH',
    MOVEMENT: 'CONDITION_TARGET_ID.STAT.MOVEMENT',
    SANITY: 'CONDITION_TARGET_ID.STAT.SANITY',
    VISION: 'CONDITION_TARGET_ID.STAT.VISION',
    CANDIES: 'CONDITION_TARGET_ID.STAT.CANDIES',
    LUCK: 'CONDITION_TARGET_ID.STAT.LUCK',
    GREED: 'CONDITION_TARGET_ID.STAT.GREED',
  },

  LOCATION: 'CONDITION_TARGET_ID.LOCATION',
};
export const CONDITION_TARGET_ID_LIST = convertObjectToArray(CONDITION_TARGET_ID);
