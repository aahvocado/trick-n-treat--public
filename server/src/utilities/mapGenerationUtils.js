import { getRandomIntInclusive } from 'utilities/mathUtils';

// temporary constants just for reference
const TILE_TYPE = {
  0: 'empty',
  1: 'path',
  2: 'stuff',
};
/**
 * documentation for the types
 *
 * @typedef {Array<Array>} Map
 *
 * @typedef {Object} MapConfig
 * @property {Number} MapConfig.width - number of horizontal tiles
 * @property {Number} MapConfig.height - number of vertical tiles
 * @property {Number} MapConfig.numSpecials - number of special tiles
 */

/**
 * goes through the entire generation process
 *
 * @param {MapConfig} mapConfig
 * @returns {Map}
 */
export function generateMap(mapConfig) {
  const emptyMap = generateRoom(mapConfig);
  const specialMap = generateSpecialTiles(emptyMap, mapConfig.numSpecials);

  return specialMap;
}
/**
 * creates a 2D array representing a room
 *
 * @param {MapConfig} mapConfig
 * @returns {Map}
 */
function generateRoom({width, height}) {
  let map = [];

  for (var x = 0; x < width; x++) {
    map.push([]);
    for (var y = 0; y < height; y++) {
      map[x][y] = 0;
    }
  }

  return map;
}
/**
 * creates a random tile type
 *
 * @returns {Number}
 */
function getRandomTileType() {
  return getRandomIntInclusive(2, 5);
}
/**
 * places special rooms
 *  picks a location based on the currentMap
 *
 * @param {Map} currentMap
 * @param {Number} numSpecials
 * @returns {Map}
 */
function generateSpecialTiles(currentMap, numSpecials) {
  const height = currentMap.length;
  const width = currentMap[0].length;

  for (var i = 0; i < numSpecials; i ++) {
    // we want to pick a location that's not at the extremes
    const randomRow = getRandomIntInclusive(1, height - 2);
    const randomCol = getRandomIntInclusive(1, width - 2);

    // set the index of the chosen coordinates to a random tile type
    currentMap[randomRow][randomCol] = getRandomTileType();
  }

  return currentMap;
}
