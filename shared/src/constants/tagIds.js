import convertObjectToArray from 'utilities.shared/convertObjectToArray';

/**
 * hmm, the idea is that when searching for a thing that is custom made
 *  you would search by tags
 */

/**
 * @typedef {String} TagId
 */
export const TAG_ID = {
  TYPE: {
    DEBUG: 'TAG_ID.TYPE.DEBUG',
    ENCOUNTER: 'TAG_ID.TYPE.ENCOUNTER',
    HOUSE: 'TAG_ID.TYPE.HOUSE',
    ITEM: 'TAG_ID.TYPE.ITEM',
  },

  DESCRIPTORS: {
    GIVES_ITEM: 'TAG_ID.DESCRIPTORS.GIVES_ITEM',
    ADDS_CANDY: 'TAG_ID.DESCRIPTORS.ADDS_CANDY',
    LOSES_CANDY: 'TAG_ID.DESCRIPTORS.LOSES_CANDY',
    ADDS_HEALTH: 'TAG_ID.DESCRIPTORS.ADDS_HEALTH',
    LOSES_HEALTH: 'TAG_ID.DESCRIPTORS.LOSES_HEALTH',
    ADDS_SANITY: 'TAG_ID.DESCRIPTORS.ADDS_SANITY',
    LOSES_SANITY: 'TAG_ID.DESCRIPTORS.LOSES_SANITY',
  },

  RARITY: {
    COMMON: 'TAG_ID.RARITY.COMMON',
    UNCOMMON: 'TAG_ID.RARITY.UNCOMMON',
    RARE: 'TAG_ID.RARITY.RARE',
  },
};
/**
 * caches an array of the all the TagIds
 */
export const TAG_ID_LIST = convertObjectToArray(TAG_ID);
/** @type {Array} */
export const TYPES_TAG_ID_LIST = [
  TAG_ID.TYPE.DEBUG,
  TAG_ID.TYPE.ENCOUNTER,
  TAG_ID.TYPE.HOUSE,
  TAG_ID.TYPE.ITEM,
];
/** @type {Array} */
export const DESCRIPTORS_TAG_ID_LIST = [
  TAG_ID.DESCRIPTORS.GIVES_ITEM,
  TAG_ID.DESCRIPTORS.ADDS_CANDY,
  TAG_ID.DESCRIPTORS.LOSES_CANDY,
  TAG_ID.DESCRIPTORS.ADDS_HEALTH,
  TAG_ID.DESCRIPTORS.LOSES_HEALTH,
  TAG_ID.DESCRIPTORS.ADDS_SANITY,
  TAG_ID.DESCRIPTORS.LOSES_SANITY,
];
/** @type {Array} */
export const RARITY_TAG_ID_LIST = [
  TAG_ID.RARITY.COMMON,
  TAG_ID.RARITY.UNCOMMON,
  TAG_ID.RARITY.RARE,
];
