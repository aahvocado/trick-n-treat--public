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
const TILE_ID_MAP = {
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
/**
 * TileId will map the above object to a number starting with 0,
 *  don't use the actual number since this list can be dynamic as more tiles are added
 *
 * example
 * - `TILE_ID.EMPTY: 0`
 * - `TILE_ID.EMPTY_WALL: 1`
 *
 * @type {Object}
 */
export const TILE_ID = convertBaseToId(TILE_ID_MAP, 0);
/** @type {Array} */
// export const TILE_ID_LIST = convertObjectToArray(TILE_ID);
/**
 * @param  {Object} baseMap
 * @param  {Number} [baseIdNum]
 * @returns {Object}
 */
function convertBaseToId(baseMap, baseIdNum = 0) {
  const result = {};

  const keys = Object.keys(baseMap);
  keys.forEach((key, idx) => {
    const value = baseMap[key];

    // if the value here is another object, recursively convert that as well
    if (typeof value === 'object') {
      const nestedObject = convertBaseToId(value, baseIdNum);
      result[key] = nestedObject;

      baseIdNum += Object.keys(nestedObject).length;
    } else {
      // use the index as the id,
      // - add offset
      // - multiply by 2 to account for the wall which is going to be + 1 of the base tile
      const idNum = (idx * 2) + baseIdNum;
      const idWallNum = idNum + 1;

      // assign
      result[key] = idNum;
      result[`${key}_WALL`] = idWallNum;
    }
  });

  return result;
}
/**
 * this is the reverse of the above Key/Value map,
 * @example { 0: 'EMPTY', 1: 'EMPTY_WALL', 2: 'BLACK' }
 * @type {Object}
 */
export const TILE_ID_NAME = convertIdToName(TILE_ID);
/** @type {Array} */
export const TILE_ID_NAME_LIST = convertObjectToArray(TILE_ID_NAME);
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
/**
 *
 */
export const TILE_ID_HOUSE_LIST = [
  TILE_ID.HOME.HOUSE,
  TILE_ID.HOME.HOUSE2,
  TILE_ID.HOME.HOUSE3,
];
