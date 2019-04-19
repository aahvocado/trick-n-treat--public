import Point from '@studiomoniker/point';

import {TILE_TYPES} from 'constants/tileTypes';

/**
 * Matrix represents 2D array
 *
 * @typedef {Array<Array>} Matrix
 *
 * @typedef {Object} TypeCounts
 */

// -- basic Matrix methods
/**
 * creates a 2D array of empty tiles
 *
 * @param {Number} width
 * @param {Number} height
 * @param {TileData} [defaultValue]
 * @returns {Matrix}
 */
export function createMatrix(width, height, defaultValue = TILE_TYPES.EMPTY) {
  const matrix = [];

  for (let y = 0; y < height; y++) {
    matrix.push([]);
    for (let x = 0; x < width; x++) {
      matrix[y][x] = defaultValue;
    }
  }

  return matrix;
}
/**
 * @param {Matrix} matrix
 * @returns {Number}
 */
export function getWidth(matrix) {
  return matrix[0].length;
}
/**
 * @param {Matrix} matrix
 * @returns {Number}
 */
export function getHeight(matrix) {
  return matrix.length;
}
/**
 * gets the center Point of this Matrix
 *
 * @param {Matrix} matrix
 * @returns {Point}
 */
export function getCenter(matrix) {
  return new Point(
    Math.floor(getWidth(matrix) / 2),
    Math.floor(getHeight(matrix) / 2),
  );
}
/**
 * helper function to iterate through each tile
 *
 * @param {Matrix} matrix
 * @param {Function} callback
 */
export function forEach(matrix, callback) {
  matrix.forEach((row, y) => {
    row.forEach((tileData, x) => {
      /**
       * callback arguments:
       * @param {TileData} tileData
       * @param {Point} tilePoint
       */
      callback(tileData, new Point(x, y));
    });
  });
}
/**
 * helper function for running map through a 2D array
 *
 * @param {Matrix} matrix
 * @param {Function} callback
 * @returns {Matrix}
 */
export function map(matrix, callback) {
  return matrix.map((row, y) => {
    return row.map((tileData, x) => {
      /**
       * callback arguments:
       * @param {TileData} tileData
       * @param {Point} tilePoint
       */
      return callback(tileData, new Point(x, y));
    });
  });
}
/**
 * replaces the TileData at a given Point
 *
 * @param {Matrix} matrix
 * @param {Point} point
 * @param {TileData} newTileData
 * @returns {Boolean} - returns true if successfully set
 */
export function setTileAt(matrix, point, newTileData) {
  const tileData = matrix[point.y] !== undefined ? matrix[point.y][point.x] : undefined;
  if (tileData === undefined) {
    return false;
  }

  matrix[point.y][point.x] = newTileData;
  return true;
}
/**
 * updates all points in an list to given `tileData`
 *
 * @param {Matrix} matrix
 * @param {Array<Point>} pointList
 * @param {TileData} tileData
 */
export function setTileList(matrix, pointList, tileData) {
  pointList.forEach((point) => {
    setTileAt(matrix, point, tileData);
  });
}
/**
 * replace a Matrix with another Matrix
 * - will not replace with `null` tiles
 * - if the `childMatrix` doesn't fit, it will just be truncated
 *
 * @param {Matrix} parentMatrix
 * @param {Matrix} childMatrix
 * @param {Point} [point] - coordinates to place, defaults to top-left otherwise
 * @returns {Matrix}
 */
export function mergeMatrices(parentMatrix, childMatrix, point = new Point(0, 0)) {
  forEach(childMatrix, (tileData, position) => {
    // don't replace existing tiles with null tiles
    if (tileData === null) {
      return;
    }

    // find the relative position of the submatrix to the parent and try to replace the data there
    const adjustedPoint = point.clone().add(position);
    setTileAt(parentMatrix, adjustedPoint, tileData);
  });

  return parentMatrix;
}
// --- finding Tile data
/**
 * @param {Matrix} matrix
 * @param {Point} point
 * @returns {TileData | undefined}
 */
export function getTileAt(matrix, point) {
  // check for out of bounds
  if (matrix[point.y] === undefined) {
    return undefined;
  };

  return matrix[point.y][point.x];
}
/**
 * @param {Matrix} matrix
 * @param {Point} point
 * @param {Point} [distance]
 * @returns {TileData | undefined}
 */
export function getTileLeft(matrix, point, distance = 1) {
  const newPoint = point.clone().subtractX(distance);
  return getTileAt(matrix, newPoint);
}
/**
 * @param {Matrix} matrix
 * @param {Point} point
 * @param {Point} [distance]
 * @returns {TileData | undefined}
 */
export function getTileRight(matrix, point, distance = 1) {
  const newPoint = point.clone().addX(distance);
  return getTileAt(matrix, newPoint);
}
/**
 * @param {Matrix} matrix
 * @param {Point} point
 * @param {Point} [distance]
 * @returns {TileData | undefined}
 */
export function getTileAbove(matrix, point, distance = 1) {
  const newPoint = point.clone().addY(distance);
  return getTileAt(matrix, newPoint);
}
/**
 * @param {Matrix} matrix
 * @param {Point} point
 * @param {Point} [distance]
 * @returns {TileData | undefined}
 */
export function getTileBelow(matrix, point, distance = 1) {
  const newPoint = point.clone().subtractY(distance);
  return getTileAt(matrix, newPoint);
}
/**
 * compares if tile at given point is equal to given comparison
 *
 * @param {Matrix} matrix
 * @param {Point} point
 * @param {*} comparison
 * @returns {Boolean}
 */
export function isTileEqualTo(matrix, point, comparison) {
  return getTileAt(matrix, point) === comparison;
}
/**
 * finds if Matrix has ANY instance of given TileData
 *
 * @param {Matrix} matrix
 * @param {TileType} tileType
 * @returns {Boolean}
 */
export function containsTileType(matrix, tileType) {
  return matrix.some((row) => {
    return row.includes(tileType);
  });
}
/**
 * finds if there are any tiles of given Type in a Matrix
 *
 * @param {Matrix} matrix
 * @param {TileType} tileType
 * @returns {Number}
 */
export function getCountOfTileType(matrix, tileType) {
  return matrix.reduce((count, row) => {
    return count + row.reduce((rowCount, tile) => {
      return rowCount + (tile === tileType ? 1 : 0);
    }, 0);
  }, 0);
}
/**
 * gives back the number of each type of tile in a matrix
 *
 * @param {Matrix} matrix - 3x3
 * @returns {TypeCounts}
 */
export function getTypeCounts(matrix) {
  // will be returned
  const typeMap = {};

  forEach(matrix, (tileData) => {
    // types that can't be handled
    if (tileData === undefined || tileData === null) {
      return;
    }

    // if it doesn't exist, create it in the map
    if (typeMap[tileData] === undefined) {
      typeMap[tileData] = 1;
      return;
    }

    // otherwise add to the count
    typeMap[tileData] += 1;
  });

  return typeMap;
}
/**
 * finds if there are any tiles around a Point of given Type
 *
 * @param {Matrix} matrix
 * @param {Point} point
 * @param {Number} [distance]
 * @returns {TypeCounts}
 */
export function getTypeCountsAdjacentTo(matrix, point, distance = 1) {
  // get submatrix
  const submatrix = getSubmatrixByDistance(matrix, point, distance);

  // the center point does not count
  const submatrixWidth = submatrix[0].length;
  const submatrixHeight = submatrix.length;
  submatrix[Math.floor(submatrixHeight / 2)][Math.floor(submatrixWidth / 2)] = null;

  // use that submatrix to get the counts
  return getTypeCounts(submatrix);
}
// -- Submatrix methods
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
  for (let y = topLeftY; y < (bottomRightY); y++) {
    const row = matrix[y];
    if (row === undefined || row.length < bottomRightX - topLeftX) {
      return null;
    }

    submatrix.push(row.slice(topLeftX, bottomRightX)); // offset by 1 to be inclusive
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
  // make a copy to remove tiles that are too far
  const nullMatrix = createMatrix(matrix[0].length, matrix.length, null);
  forEach(nullMatrix, (tile, tilePoint) => {
    const x = tilePoint.x;
    const y = tilePoint.y;

    const distanceFromOriginY = Math.abs(point.clone().y - y);
    const distanceFromOriginX = Math.abs(point.clone().x - x);

    // set tile to available if it's within distance
    if (distanceFromOriginY + distanceFromOriginX <= distance) {
      nullMatrix[y][x] = matrix[y][x];
    };
  });

  // get the submatrix with all the tiles
  const submatrix = getSubmatrixSquareByDistance(nullMatrix, point, distance);
  return submatrix;
}
// -- finding Points (coordinates)
/**
 * returns a LIST of Points within given distance away from a point
 *  but only by adjacent tiles (so diagonals are 2 spaces away)
 *
 * @param {Matrix} matrix
 * @param {Point} point - where to start looking from
 * @param {Number} distance - how many tiles further to check
 * @returns {Array<Point>}
 */
export function getPointsListOfNearbyTiles(matrix, point, distance) {
  const pointsList = [];

  forEach(matrix, (tile, tilePoint) => {
    // add it to the list of it's within distance
    if (getDistanceBetween(point, tilePoint) <= distance) {
      pointsList.push(tilePoint);
    };
  });

  return pointsList;
}
/**
 * returns a MATRIX of Points within given distance away from a point
 *  but only by adjacent tiles (so diagonals are 2 spaces away)
 *
 * @todo - not sure what the use is yet, this might get changed
 *
 * @param {Matrix} matrix
 * @param {Point} point - where to start looking from
 * @param {Number} distance - how many tiles further to check
 * @returns {Matrix}
 */
export function getPointsMatrixOfNearbyTiles(matrix, point, distance) {
  return map(matrix, (tile, tilePoint) => {
    // set onto matrix if within distance
    if (getDistanceBetween(point, tilePoint) <= distance) {
      return tilePoint;
    };

    // null if not
    return null;
  });
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
  const {x, y} = point;
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
 * finds the closest point of the Tile that matches given point
 *
 * @param {Matrix} matrix
 * @param {Point} startPoint
 * @param {Tile} type - what you're looking for
 * @param {Number} distance - how many tiles further to check
 * @returns {Point}
 */
export function getPointOfNearestTileType(matrix, startPoint, type, distance) {
  // keep track of what the Position and Distance of the most recently found Tile that matches the type
  let currentNearestDistance = distance;
  let currentNearestPoint = undefined;

  // look at the nearby tiles, then iterate through them to see if any of them are of given Type
  const nearbyPointsList = getPointsListOfNearbyTiles(matrix, startPoint, distance);
  nearbyPointsList.forEach((nearbyPoint) => {
    // don't care about different types
    const tileType = getTileAt(matrix, nearbyPoint);
    if (tileType !== type) {
      return;
    }

    // don't care about tiles that are farther than the one we found
    const tileDistance = getDistanceBetween(startPoint, nearbyPoint);
    if (tileDistance > currentNearestDistance) {
      return;
    }

    // found a contender, so save it
    currentNearestDistance = tileDistance;
    currentNearestPoint = nearbyPoint.clone();
  });

  // after going through the process, we can finally return the Point of the Tile with the asked for Type
  return currentNearestPoint;
}
// -- distance methods
/**
 * gets how many tiles apart two points are
 * (only adjacently, so diagonals count as 2 tiles away)
 *
 * @param {Point} pointA
 * @param {Point} pointB
 * @returns {Number}
 */
export function getDistanceBetween(pointA, pointB) {
  const differenceX = Math.abs(pointA.x - pointB.x);
  const differenceY = Math.abs(pointA.y - pointB.y);
  return differenceX + differenceY;
}
/**
 *
 * @param {Matrix} matrix
 * @param {Point} pointA
 * @param {Point} pointB
 * @param {Number} distance
 * @returns {Boolean}
 */
export function isWithinDistance(matrix, pointA, pointB, distance) {
  // calculate how many tiles it would take to move to the point
  const tileDistance = getDistanceBetween(pointA, pointB);
  if (tileDistance > distance) {
    return false;
  }

  return true;
}
