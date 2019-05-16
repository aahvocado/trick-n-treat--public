import convertObjectToArray from 'utilities.shared/convertObjectToArray';

/**
 * hmm, the idea is that when searching for a thing that is custom made
 *  you would search by tags
 */

/**
 * @typedef {String} TagId
 */
export const TAG_ID = {
  // -- data types
  ENCOUNTER: 'TAG_ID.ENCOUNTER',
  QUEST: 'TAG_ID.QUEST',
  ITEM: 'TAG_ID.ITEM',
  CONSUMABLE: 'TAG_ID.CONSUMABLE',

  // -- descriptors
  CANDY: 'TAG_ID.CANDY',
  SANITY: 'TAG_ID.SANITY',
  HEALTH: 'TAG_ID.HEALTH',
  MOVEMENT: 'TAG_ID.MOVEMENT',

  // -- tile types
  PATH: 'TAG_ID.PATH',
  GRASS: 'TAG_ID.GRASS',
  SIDEWALK: 'TAG_ID.SIDEWALK',
  ROAD: 'TAG_ID.ROAD',
  SWAMP: 'TAG_ID.SWAMP',
  PLANKS: 'TAG_ID.PLANKS',
  WOODS: 'TAG_ID.WOODS',
  HOUSE: 'TAG_ID.HOUSE',

  // -- debugging?
  DEBUG: 'TAG_ID.DEBUG',
};
/**
 * caches an array of the all the TagIds
 */
export const TAG_ID_LIST = convertObjectToArray(TAG_ID);
