import Pathfinding from 'pathfinding';
import Point from '@studiomoniker/point';

import {
  TILE_TYPES,
  isWalkableTile,
} from 'constants.shared/tileTypes';

import * as mathUtils from 'utilities.shared/mathUtils';
import * as matrixUtils from 'utilities.shared/matrixUtils';

/**
 * @typedef {Array<Point>} Path
 */

// -- pathfinding
/**
 * for the Pathfinding package, 0 is walkable and 1 is a wall
 *  we need to convert our Matrix to be be compliant
 * @see https://github.com/qiao/PathFinding.js
 *
 * @param {Matrix} matrix
 * @returns {Matrix}
 */
export function createGridForPathfinding(matrix) {
  return new Pathfinding.Grid(matrixUtils.map(matrix, (tile, point) => {
    // empty tiles are unwalkable
    if (tile === TILE_TYPES.EMPTY || tile === null) {
      return 1;
    }

    // otherwise we'll have it walkable
    return 0;
  }));
}
/**
 * finds if a matrix contains a type
 *
 * @param {Matrix} matrix
 * @param {Point} startPoint
 * @param {Point} endPoint
 * @returns {Path}
 */
export function getAStarPath(matrix, startPoint, endPoint) {
  const grid = createGridForPathfinding(matrix);
  const finder = new Pathfinding.AStarFinder();
  const coordinatePath = finder.findPath(startPoint.x, startPoint.y, endPoint.x, endPoint.y, grid);

  // finder gives us Array of Array [x, y] - we'll convert it to a more convenient Array<Point>
  const pointPath = coordinatePath.map((coordinate) => (new Point(coordinate[0], coordinate[1])));
  return pointPath;
}
/**
 * returns a Matrix with a path created
 *
 * @param {Matrix} matrix
 * @param {Point} startPoint
 * @param {Point} endPoint
 * @param {TileType} [tileType]
 * @returns {Matrix}
 */
export function createPath(matrix, startPoint, endPoint, tileType = TILE_TYPES.NULL) {
  const matrixCopy = matrix.slice();

  const aStarPath = getAStarPath(matrixCopy, startPoint, endPoint);
  aStarPath.forEach((pathPoint) => {
    matrixUtils.setTileAt(matrixCopy, pathPoint, tileType);
  });

  return matrixCopy;
}
/**
 * @param {Matrix} matrix
 * @param {Point} startPoint
 * @param {Point} endPoint
 * @param {Number} distance
 * @returns {Boolean}
 */
export function isWithinPathDistance(matrix, startPoint, endPoint, distance) {
  // create a path that walks to the point
  const path = getAStarPath(matrix, startPoint, endPoint);

  // check if path does not exist, or is too far
  // (we add one to the distance to account for the starting point)
  if (path.length <= 0 || path.length > (distance + 1)) {
    return false;
  };

  return true;
}
/**
 * gets all Points that are within walkable distance
 *
 * @param {Matrix} matrix
 * @param {Point} startPoint
 * @param {Number} distance
 * @returns {Array<Points>}
 */
export function getPointsWithinPathDistance(matrix, startPoint, distance) {
  const submatrixPoints = [];

  matrixUtils.forEach(matrix, (tile, tilePoint) => {
    const x = tilePoint.x;
    const y = tilePoint.y;

    const distanceFromOriginY = Math.abs(startPoint.clone().y - y);
    const distanceFromOriginX = Math.abs(startPoint.clone().x - x);

    // if it is too far, it does not need to be considered
    if (distanceFromOriginY + distanceFromOriginX > distance) {
      return;
    };

    // create a path that walks to the point
    const path = getAStarPath(matrix, startPoint, tilePoint);

    // check if path does not exist, or is too far
    // (we add one to the distance to account for the starting point)
    if (path.length <= 0 || path.length > (distance + 1)) {
      return;
    };

    // point is within walking distance so add it to the list
    submatrixPoints.push(tilePoint);
  });

  return submatrixPoints;
}
// -- map searching
/**
 * iterates through each point and returns anything that fulfils the given callback with condition
 *
 * @param {Matrix} matrix
 * @param {Function} callback - make sure this returns a truthy
 * @returns {Array<Point>}
 */
export function findPoints(matrix, callback) {
  const points = [];

  matrixUtils.forEach(matrix, (tileData, tilePoint) => {
    if (callback(tileData, tilePoint)) {
      points.push(tilePoint);
    };
  });

  return points;
}
/**
 * iterates through each point and returns anything that fulfils the given callback with condition
 *
 * @param {Matrix} matrix
 * @param {Point} startPoint
 * @param {Function} callback - make sure this returns a truthy
 * @returns {Array<Point>}
 */
export function findPointNearestConditionally(matrix, startPoint, callback) {
  // keep track of what the Position and Distance of the most recently found Tile that matches the type
  let currentNearestDistance = matrixUtils.getWidth(matrix);
  let currentNearestPoint = undefined;

  // look at the nearby tiles, then iterate through them to see if any of them are of given Type
  const nearbyPointsList = matrixUtils.getPointsListOfNearbyTiles(matrix, startPoint, matrixUtils.getWidth(matrix));
  nearbyPointsList.forEach((tilePoint) => {
    const tileType = matrixUtils.getTileAt(matrix, tilePoint);
    if (callback(tileType, tilePoint)) {
      // don't care about tiles that are farther than the one we found
      const tileDistance = matrixUtils.getDistanceBetween(startPoint, tilePoint);
      if (tileDistance > currentNearestDistance) {
        return;
      }

      // found a contender, so save it
      currentNearestDistance = tileDistance;
      currentNearestPoint = tilePoint.clone();
    }
  });

  // after going through the process, we can finally return the Point of the Tile with the asked for Type
  return currentNearestPoint;
}
/**
 * finds the closest point of the Tile that is walkable
 * @todo - refactor since this is nearly identical `getPointOfNearestTileType()` in `matrixUtils.js`
 *
 * @param {Matrix} matrix
 * @param {Point} startPoint
 * @param {Number} distance
 * @returns {Point}
 */
export function getPointOfNearestWalkableType(matrix, startPoint, distance) {
  return findPointNearestConditionally(matrix, startPoint, (tileType, tilePoint) => (
    isWalkableTile(tileType) && matrixUtils.getDistanceBetween(startPoint, tilePoint) <= distance
  ));
}
/**
 * gets all locations that a given dimension will fit into
 *  if you pass in width and height it will make sure there is enough space with given dimensions
 *
 * @param {Matrix} matrix
 * @param {Number} [width]
 * @param {Number} [height]
 * @returns {Array<Point>}
 */
export function getValidEmptyLocations(matrix, width = 1, height = 1) {
  const potentialLocations = [];

  matrixUtils.forEach(matrix, (tileData, tilePoint) => {
    // only look at empty tiles
    if (tileData !== null && tileData !== TILE_TYPES.EMPTY) {
      return;
    }

    // will this fit?
    const topLeftPoint = new Point(tilePoint.x, tilePoint.y);
    const bottomRightPoint = new Point(tilePoint.x + width - 1, tilePoint.y + height - 1);
    const submatrix = matrixUtils.getSubmatrixSquare(matrix, topLeftPoint, bottomRightPoint);
    if (submatrix === undefined || matrixUtils.getHeight(submatrix) < height || matrixUtils.getWidth(submatrix) < width) {
      return;
    }

    // are there enough empty spaces here?
    const typeCounts = matrixUtils.getTypeCounts(submatrix);
    if (typeCounts[TILE_TYPES.EMPTY] < (width * height)) {
      return;
    }

    // this is valid
    potentialLocations.push(tilePoint);
  });

  return potentialLocations;
}
/**
 * we want to pick a good location to place something
 *  if you pass in width and height it will make sure there is enough space with given dimensions
 *
 * @param {Matrix} matrix
 * @param {Number} [width]
 * @param {Number} [height]
 * @returns {Point}
 */
export function getRandomEmptyLocation(matrix, width = 1, height = 1) {
  const potentialLocations = getValidEmptyLocations(matrix, width, height);
  const randomPotentialIndex = mathUtils.getRandomIntInclusive(0, potentialLocations.length - 1);
  return potentialLocations[randomPotentialIndex];
}
/**
 * tries to finds a random location and near a given TileType
 *
 * @param {Matrix} matrix
 * @param {Number} [width]
 * @param {Number} [height]
 * @param {Number} [distance]
 * @returns {Point}
 */
export function getRandomEmptyLocationNearWalkableTile(matrix, width = 1, height = 1, distance = 3) {
  const potentialLocations = getValidEmptyLocations(matrix, width, height);

  // find the center point of the potential area
  const adjustedCenter = new Point(Math.floor((width - 1) / 2), Math.floor((height - 1) / 2));

  // find those who are close to a Walkable Tile
  const nearbyPotentialLocations = potentialLocations.filter((potentialPoint) => {
    const adjustedPoint = potentialPoint.clone().add(adjustedCenter.clone());
    const adjustedDistance = adjustedCenter.x > adjustedCenter.y ? (adjustedCenter.clone().x + distance) : (adjustedCenter.clone().y + distance);

    const nearbyPoint = getPointOfNearestWalkableType(matrix, adjustedPoint, adjustedDistance);
    // console.log('chosen nearbyPoint is', nearbyPoint, 'for adjusted', adjustedPoint);
    return nearbyPoint !== undefined;
  });

  // pick one of the valid nearby tiles
  const randomPotentialIndex = mathUtils.getRandomIntInclusive(0, nearbyPotentialLocations.length - 1);
  return nearbyPotentialLocations[randomPotentialIndex];
}
