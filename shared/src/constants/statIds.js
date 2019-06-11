import convertObjectToArray from 'utilities.shared/convertObjectToArray';

/**
 * @typedef {String} StatId
 */
export const STAT_ID = {
  HEALTH: 'STAT_ID.HEALTH',
  MOVEMENT: 'STAT_ID.MOVEMENT',
  SANITY: 'STAT_ID.SANITY',
  VISION: 'STAT_ID.VISION',
  CANDIES: 'STAT_ID.CANDIES',
  TRICKY: 'STAT_ID.TRICKY',
  TREATY: 'STAT_ID.TREATY',
  LUCK: 'STAT_ID.LUCK',
  GREED: 'STAT_ID.GREED',
  POSITION: 'STAT_ID.POSITION',

  NEIGHBORS_FAVOR: 'STAT_ID.NEIGHBORS_FAVOR',
};
/** @type {Array<StatId>} */
export const STAT_ID_LIST = convertObjectToArray(STAT_ID);
