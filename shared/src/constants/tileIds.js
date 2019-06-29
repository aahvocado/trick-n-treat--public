import convertObjectToArray from 'utilities.shared/convertObjectToArray';

/**
 * `TileId` will always be a number,
 *
 * with 0 being an empty space
 *  odd numbers will regular tiles
 *  even numbers are the walled version of the previous number
 *
 * @typedef {Number} TileId
 */
const TILE_ID_BASE = {
  EMPTY: 'TILE_ID.EMPTY',
  DEBUG: {
    BLACK: 'TILE_ID.DEBUG.BLACK',
    GRAY: 'TILE_ID.DEBUG.GRAY',
    WHITE: 'TILE_ID.DEBUG.WHITE',
    RED: 'TILE_ID.DEBUG.RED',
    ORANGE: 'TILE_ID.DEBUG.ORANGE',
    YELLOW: 'TILE_ID.DEBUG.YELLOW',
    GREEN: 'TILE_ID.DEBUG.GREEN',
    BLUE: 'TILE_ID.DEBUG.BLUE',
    INDIGO: 'TILE_ID.DEBUG.INDIGO',
    VIOLET: 'TILE_ID.DEBUG.VIOLET',
    PINK: 'TILE_ID.DEBUG.PINK',
    PEACH: 'TILE_ID.DEBUG.PEACH',
    LIME: 'TILE_ID.DEBUG.LIME',
    MOSS: 'TILE_ID.DEBUG.MOSS',
    SKY: 'TILE_ID.DEBUG.SKY',
    DENIM: 'TILE_ID.DEBUG.DENIM',
    SAND: 'TILE_ID.DEBUG.SAND',
    COFFEE: 'TILE_ID.DEBUG.COFFEE',
    CHOCOLATE: 'TILE_ID.DEBUG.CHOCOLATE',
  },

  HOME: {
    HIDEOUT: 'TILE_ID.HOME.HIDEOUT',

    HOUSE: 'TILE_ID.HOME.HOUSE',
    SIDEWALK: 'TILE_ID.HOME.SIDEWALK',
    ROAD: 'TILE_ID.HOME.ROAD',
    LAWN: 'TILE_ID.HOME.LAWN',
    STREETLAMP: 'TILE_ID.HOME.STREETLAMP',

    HOUSE2: 'TILE_ID.HOME.HOUSE2',
    SIDEWALK2: 'TILE_ID.HOME.SIDEWALK2',
    ROAD2: 'TILE_ID.HOME.ROAD2',
    LAWN2: 'TILE_ID.HOME.LAWN2',
    STREETLAMP2: 'TILE_ID.HOME.STREETLAMP2',

    HOUSE3: 'TILE_ID.HOME.HOUSE3',
    SIDEWALK3: 'TILE_ID.HOME.SIDEWALK3',
    ROAD3: 'TILE_ID.HOME.ROAD3',
    LAWN3: 'TILE_ID.HOME.LAWN3',
    STREETLAMP3: 'TILE_ID.HOME.STREETLAMP3',
  },

  PARK: {
    GRASS: 'TILE_ID.PARK.GRASS',
    FLOWERS: 'TILE_ID.PARK.FLOWERS',
    BENCH: 'TILE_ID.PARK.BENCH',
    BUSH: 'TILE_ID.PARK.BUSH',
    TREE: 'TILE_ID.PARK.TREE',
  },
};
export const TILE_NUM_ID = {};
export const TILE_ID = TILE_ID_BASE;
createCompleteIds(TILE_ID, TILE_NUM_ID);
/**
 * @param {Object} idMap
 * @param {Object} numMap
 * @param {Number} [idNum]
 */
function createCompleteIds(idMap, numMap, idNum = 0) {
  const keys = Object.keys(idMap);
  keys.forEach((key, idx) => {
    if (numMap[key] === undefined) {
      numMap[key] = {};
    };

    const value = idMap[key];
    if (typeof value === 'object') {
      createCompleteIds(idMap[key], numMap[key], idNum);
      idNum += Object.keys(value).length * 2;
      // idMap[key] = nestedObject;
      // numMap[key] = nestedObject;
    } else {
      idMap[`${key}_WALL`] = `${value}_WALL`;

      numMap[key] = idNum;
      numMap[`${key}_WALL`] = idNum + 1;
      idNum += 2;
    }
  });
};
/** @type {Array} */
export const TILE_NUM_TO_STRING_MAP = convertNumToString(TILE_NUM_ID, TILE_ID);
/**
 * @param  {Object} baseMap
 * @param  {Object} trackMap
 * @returns {Object}
 */
function convertNumToString(baseMap, trackMap) {
  let result = {};

  const keys = Object.keys(baseMap);
  keys.forEach((key) => {
    const value = baseMap[key];
    if (typeof value === 'object') {
      result = {...result, ...convertNumToString(value, trackMap[key])};
    } else {
      result[value] = trackMap[key];
    }
  });

  return result;
};
/** @type {Array} */
export const TILE_STRING_TO_NUM_MAP = reverseMap(TILE_NUM_TO_STRING_MAP);
/**
 * @param  {Object} baseMap
 * @returns {Object}
 */
function reverseMap(baseMap) {
  const result = {};

  const keys = Object.keys(baseMap);
  keys.forEach((key) => {
    const value = baseMap[key];
    result[value] = Number(key);
  });

  return result;
};
/** @type {Array} */
export const TILE_ID_NAME_MAP = convertIdToName(TILE_NUM_ID);
/**
 * @param  {Object} nameMap
 * @returns {Object}
 */
function convertIdToName(nameMap) {
  let result = {};

  Object.keys(nameMap).forEach((key) => {
    const value = nameMap[key];
    if (typeof value === 'object') {
      const nestedObject = convertIdToName(value);
      result = {...result, ...nestedObject};
    } else {
      result[value] = key;
    }
  });

  return result;
};
/** @type {Array} */
export const TILE_ID_STRING_LIST = Object.keys(TILE_ID_NAME_MAP).map((key) => key);
/** @type {Array} */
export const TILE_ID_NAME_LIST = convertObjectToArray(TILE_ID_NAME_MAP);
/**
 *
 */
export const TILE_ID_HOUSE_LIST = [
  TILE_ID.HOME.HIDEOUT,
  TILE_ID.HOME.HOUSE,
  TILE_ID.HOME.HOUSE2,
  TILE_ID.HOME.HOUSE3,
];

// console.log('TILE_ID', TILE_ID);
// console.log('TILE_NUM_ID', TILE_NUM_ID);
// console.log('TILE_NUM_TO_STRING_MAP', TILE_NUM_TO_STRING_MAP);
// console.log('TILE_STRING_TO_NUM_MAP', TILE_STRING_TO_NUM_MAP);
