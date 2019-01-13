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
