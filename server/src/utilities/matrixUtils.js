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
 * finds if there are any tiles adjacent to a Point of given Type
 *
 * @param {Matrix} matrix
 * @param {Point} point - where to look from
 * @param {Tile} type - what you're looking for
 * @param {Number} distance - how many tiles further to check
 * @returns {Boolean}
 */
export function hasAdjacentTileType(matrix, point, type, distance) {
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

