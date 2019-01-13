/**
 * Matrix represents 2D array
 *
 * @typedef {Array<Array>} Matrix
 */

/**
 * gets Submatrix of a larger Matrix
 *
 * @param {Matrix} matrix
 * @param {Number} topLeftX
 * @param {Number} topLeftY
 * @param {Number} bottomRightX
 * @param {Number} bottomRightY
 * @returns {Matrix | null}
 */
export function getSubmatrix(matrix, topLeftX, topLeftY, bottomRightX, bottomRightY) {
  // if the range is 0 then there's no submatrix to get
  const width = bottomRightX - topLeftX;
  if (width <= 0) {
    return null;
  }

  // iterate to get a section of larger matrix
  const submatrix = [];
  for (var y = topLeftY; y < bottomRightY; y++) {
    const row = matrix[y];
    submatrix.push(row.slice(topLeftX, bottomRightX + 1)); // offset by 1 to be inclusive
  }

  return submatrix;
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
  // with a distance of zero there will never be anything nearby
  if (distance <= 0) {
    return false;
  }

  // find get the submatrix and look within it
  const submatrix = getSubmatrix(matrix, point.x - distance, point.y - distance, point.x + distance, point.y + distance);
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
