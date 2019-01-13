/**
 * Matrix represents 2D array
 *
 * @typedef {Array<Array>} Matrix
 */

/**
 * gets an inner box from a larger Matrix
 *
 * @param {Matrix} matrix
 * @param {Number} topLeftX
 * @param {Number} topLeftY
 * @param {Number} bottomRightX
 * @param {Number} bottomRightY
 * @returns {Matrix}
 */
export function getInnerMatrixData(matrix, topLeftX, topLeftY, bottomRightX, bottomRightY) {
  const foundMatrix = [];

  for (var y = topLeftY; y < bottomRightY; y++) {
    const row = matrix[y];
    foundMatrix.push(row.slice(topLeftX, bottomRightX));
  }

  return foundMatrix;
}
/**
 * finds if there are any tiles around a Point of given Type
 *
 * @param {Matrix} matrix
 * @param {Point} point - where to look from
 * @param {Tile} type - what you're looking for
 * @param {Number} distance - how many tiles further to check
 * @returns {Boolean}
 */
export function hasNearbyTileType(matrix, point, type, distance) {
  const halfDistance = Math.ceil(distance / 2);
  const submatrix = getInnerMatrixData(matrix, point.x - halfDistance, point.y - halfDistance, point.x + halfDistance + 1, point.y + halfDistance + 1);
  return containsTileType(submatrix, type);
}
/**
 * finds if a matrix contains a type
 *
 * @param {Matrix} matrix
 * @param {Tile} type - what you're looking for
 * @returns {Boolean}
 */
export function containsTileType(matrix, type) {
  return matrix.some((row) => {
    return row.includes(type);
  })
}
/**
 * finds if there are any tiles directly adjacent to a Point of given Type
 *  meaning the immediate four cardinal directions from it
 *
 * @param {Matrix} matrix
 * @param {Point} point - where to look from
 * @param {Tile} type - what you're looking for
 * @returns {Boolean}
 */
export function hasAdjacentTileType(matrix, point, type) {
  const { x, y } = point;
  // above
  if (matrix[y - 1][x] === type) {
    return true;
  }

  // below
  if (matrix[y + 1][x] === type) {
    return true;
  }

  // left
  if (matrix[y][x - 1] === type) {
    return true;
  }

  // right
  if (matrix[y][x + 1] === type) {
    return true;
  }

  // none of that type is adjacent
  return false;
}
/**
 * Durstenfeld shuffle
 * @see https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
 *
 * @param {Array} array
 * @returns {Array}
 */
export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
