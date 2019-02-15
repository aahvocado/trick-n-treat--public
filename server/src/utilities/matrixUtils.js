/**
 * Matrix represents 2D array
 *
 * @typedef {Array<Array>} Matrix
 *
 * @typedef {Object} TypeCounts
 */

// --- matrix
/**
 * helper function to iterate through each tile
 *
 * @param {Matrix} matrix
 * @param {Function} callback
 * @returns {Matrix | null}
 */
export function forEach(matrix, callback) {
  matrix.forEach((row, y) => {
    row.forEach((tile, x) => {
      /**
       * each callback will be given the tile and their position
       */
      callback(tile, x, y);
    })
  })
}
/**
 * creates a 2D array of empty tiles
 *
 * @param {Number} width
 * @param {Number} height
 * @param {*} [defaultValue]
 * @returns {Matrix}
 */
export function createMatrix(width, height, defaultValue = TILE_TYPES.EMPTY) {
  let matrix = [];

  for (var y = 0; y < height; y++) {
    matrix.push([]);
    for (var x = 0; x < width; x++) {
      matrix[y][x] = defaultValue;
    }
  }

  return matrix;
}
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
export function getSubmatrixSquare(matrix, topLeftX, topLeftY, bottomRightX, bottomRightY) {
  // if the range is 0 then there's no submatrix to get
  const width = bottomRightX - topLeftX;
  if (width <= 0) {
    return null;
  }


  // iterate to get a section of larger matrix
  const submatrix = [];
  for (var y = topLeftY; y < (bottomRightY + 1); y++) {
    const row = matrix[y];
    submatrix.push(row.slice(topLeftX, bottomRightX + 1)); // offset by 1 to be inclusive
  }

  return submatrix;
}
/**
 * calculates the appropriate coordinates given a point and distance
 *
 * @param {Matrix} matrix
 * @param {Point} point - where to look from
 * @param {Number} distance - how many tiles further to check
 * @returns {Submatrix}
 */
export function getSubmatrixSquareByDistance(matrix, point, distance) {
  // with a distance of zero there will never be anything nearby
  if (distance <= 0) {
    return false;
  }

  const topLeftX = Math.max(point.x - distance, 0);
  const topLeftY = Math.max(point.y - distance, 0);
  const bottomRightX = Math.min(point.x + distance, matrix[0].length - 1);
  const bottomRightY = Math.min(point.y + distance, matrix.length - 1);

  // find get the submatrix and look within it
  return getSubmatrixSquare(matrix, topLeftX, topLeftY, bottomRightX, bottomRightY);
}
/**
 * calculates the appropriate coordinates given a point and distance
 *  but only by adjacent tiles (so diagonals are 2 spaces away)
 *
 * @param {Matrix} matrix
 * @param {Point} point - where to look from
 * @param {Number} distance - how many tiles further to check
 * @returns {Submatrix}
 */
export function getSubmatrixByDistance(matrix, point, distance) {
  // get the submatrix with all the tiles
  const submatrix = getSubmatrixSquareByDistance(matrix, point, distance);

  const centerY = Math.floor(submatrix.length / 2);
  const centerX = Math.floor(submatrix[0].length / 2);

  forEach(submatrix, (tile, x, y) => {
    const distanceFromCenterY = Math.abs(centerY - y);
    const distanceFromCenterX = Math.abs(centerX - x);

    // set tile to null if it is too far off
    if (distanceFromCenterX + distanceFromCenterY > distance) {
      submatrix[y][x] = null;
    }
  })

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
  const submatrix = getSubmatrixSquareByDistance(matrix, point, distance);
  return containsTileType(submatrix, type);
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
// --- other
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
/**
 * finds if there are any tiles of given Type in a Matrix
 *
 * @param {Matrix} matrix
 * @param {Point} point - where to look from
 * @param {Tile} type - what you're looking for
 * @param {Number} distance - how many tiles further to check
 * @returns {Number}
 */
export function getCount(matrix, type) {
  return matrix.reduce((count, row) => {
    return count + row.reduce((rowCount, tile) => {
      return rowCount + (tile === type ? 1 : 0);
    }, 0)
  }, 0)
}
/**
 * finds if there are any tiles around a Point of given Type
 *
 * @param {Matrix} matrix - 3x3
 * @returns {TypeCounts}
 */
export function getTypeCounts(matrix) {
  // will be returned
  const typeMap = {};

  // create a copy because...
  const cleanMatrix = matrix.slice();

  // iterate through the matrix
  cleanMatrix.forEach((row) => {
    row.forEach((tile) => {
      // types that can't be handled
      if (tile === undefined || tile === null) {
        return;
      }

      // if it doesn't exist, create it in the map
      if (typeMap[tile] === undefined) {
        typeMap[tile] = 1;
        return;
      }

      // otherwise add to the count
      typeMap[tile] += 1;
    })
  })

  return typeMap;
}
/**
 * finds if there are any tiles around a Point of given Type
 *
 * @param {Matrix} matrix
 * @param {Point} point
 * @returns {TypeCounts}
 */
export function getTypeCountsAdjacentTo(matrix, point) {
  // get submatrix, ignoring the center
  const submatrix = getSubmatrixByDistance(matrix, point, 1);
  submatrix[1][1] = null;

  // use that submatrix to get the counts
  return getTypeCounts(submatrix);
}
