import convertObjectToArray from 'utilities.shared/convertObjectToArray';

/**
 * hmm, the idea is that when searching for a thing that is custom made
 *  you would search by tags
 */

/**
 * @typedef {String} TagId
 */
export const TAG_ID = {
  ENCOUNTER: 'TAG_ID.ENCOUNTER',
  HOUSE: 'TAG_ID.HOUSE',
  CANDY: 'TAG_ID.CANDY',
  SANITY: 'TAG_ID.SANITY',

  // --
  SIDEWALK: 'TAG_ID.SIDEWALK',
};
/**
 * caches an array of the all the TagIds
 */
export const TAG_ID_LIST = convertObjectToArray(TAG_ID);
