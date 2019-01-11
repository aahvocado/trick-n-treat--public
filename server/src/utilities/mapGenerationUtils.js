import { getRandomIntInclusive } from 'utilities/mathUtils';

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
  return generateRoom(mapConfig);
}
/**
 * creates a 2D array representing a room (map)
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
 *  picks a location based on the mapArray
 *
 * @param {Map} mapArray
 * @param {Number} numSpecials
 * @returns {Map}
 */
function generateSpecialTiles(mapArray, numSpecials) {
  const map = mapArray.slice();

  const height = map.length;
  const width = map[0].length;

  for (var i = 0; i < numSpecials; i ++) {
    // we want to pick a location that's not at the extremes
    const randomRow = getRandomIntInclusive(1, height - 2);
    const randomCol = getRandomIntInclusive(1, width - 2);

    // set the index of the chosen coordinates to a random tile type
    map[randomRow][randomCol] = getRandomTileType();
  }

  return map;
}
/**
 * creates a Point that indicates a direction to go
 *
 * @returns {Point}
 */
export function getRandomDirection() {
  const direction = getRandomIntInclusive(0, 3);

  switch (direction) {
    // left
    case 0:
      return {x: -1, y: 0};
    // right
    case 1:
      return {x: 1, y: 0};
    // up
    case 2:
      return {x: 0, y: 1};
    // down
    case 3:
      return {x: 0, y: -1};
  }
}
