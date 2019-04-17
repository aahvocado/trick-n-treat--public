import Pathfinding from 'pathfinding';
import Point from '@studiomoniker/point';

import {
  TILE_TYPES,
  FOG_TYPES,
  isWalkableTile,
  isLessLit,
} from 'constants/tileTypes';

import * as mathUtils from 'utilities/mathUtils';
import * as matrixUtils from 'utilities/matrixUtils';

/**
 * @typedef {Array<Point>} Path
 */

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
 * @param {Matrix} matrix
 * @param {Point} startPoint
 * @param {Number} distance
 * @returns {*}
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
/**
 * returns a Matrix with a path created
 *
 * @param {Matrix} matrix
 * @param {Point} startPoint
 * @param {Point} endPoint
 * @param {TileType} tileType
 * @returns {Matrix}
 */
export function createPath(matrix, startPoint, endPoint, tileType) {
  const matrixCopy = matrix.slice();

  const aStarPath = getAStarPath(matrixCopy, startPoint, endPoint);
  aStarPath.forEach((pathPoint) => {
    matrixUtils.setTileAt(matrixCopy, pathPoint, tileType);
  });

  return matrixCopy;
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
  // keep track of what the Position and Distance of the most recently found Tile that matches the type
  let currentNearestDistance = distance;
  let currentNearestPoint = undefined;

  // look at the nearby tiles, then iterate through them to see if any of them are of given Type
  const nearbyPointsList = matrixUtils.getPointsListOfNearbyTiles(matrix, startPoint, distance);
  nearbyPointsList.forEach((nearbyPoint) => {
    // don't care about different types
    const tileType = matrixUtils.getTileAt(matrix, nearbyPoint);
    if (!isWalkableTile(tileType)) {
      return;
    }

    // don't care about tiles that are farther than the one we found
    const tileDistance = matrixUtils.getDistanceBetween(startPoint, nearbyPoint);
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
/**
 * @todo - refactor
 *
 * @param {MapModel} fogMapModel
 * @param {MapModel} tileMapModel
 * @param {Point} startPoint
 */
export function updateFogPointToVisible(fogMapModel, tileMapModel, startPoint) {
  const nearbyPoints = getPointsWithinPathDistance(tileMapModel.getMatrix(), startPoint, 3);
  nearbyPoints.forEach((nearbyFogPoint) => {
    // if already fully visibile, do nothing
    const existingFogType = fogMapModel.getTileAt(nearbyFogPoint);
    if (existingFogType === FOG_TYPES.VISIBLE) {
      return;
    }

    // get the visibility level based on the distance
    const getPotentialFogType = (distance) => {
      if (tileDistance === 1) {
        return FOG_TYPES.DIM;
      }

      if (tileDistance === 2) {
        return FOG_TYPES.DIMMER;
      }

      if (tileDistance === 3) {
        return FOG_TYPES.DIMMEST;
      }

      return FOG_TYPES.HIDDEN;
    };

    // find what FogType this can be
    const tileDistance = matrixUtils.getDistanceBetween(startPoint, nearbyFogPoint);
    const potentialFogType = getPotentialFogType(tileDistance);

    // don't replace fog if this would be less lit than what's already there
    if (isLessLit(potentialFogType, existingFogType)) {
      return;
    }

    // update it
    fogMapModel.setTileAt(nearbyFogPoint, potentialFogType);
  });
}
/**
 * gets all locations that a given dimension will fit into
 *  if you pass in width and height it will make sure there is enough space with given dimensions
 *
 * @param {MapModel} mapModel
 * @param {Number} [width]
 * @param {Number} [height]
 * @returns {Point}
 */
export function getValidEmptyLocations(mapModel, width = 1, height = 1) {
  const potentialLocations = [];

  matrixUtils.forEach(mapModel.getMatrix(), (tileData, tilePoint) => {
    // only look at empty tiles
    if (tileData !== null && tileData !== TILE_TYPES.EMPTY) {
      return;
    }

    // will this fit?
    const mapMatrix = mapModel.getMatrix();
    const submatrix = matrixUtils.getSubmatrixSquare(mapMatrix, tilePoint.x, tilePoint.y, tilePoint.x + width - 1, tilePoint.y + height - 1);
    if (submatrix === null || submatrix.length < height || submatrix[0].length < width) {
      return;
    }

    // are there enough empty spaces here?
    const typeCounts = matrixUtils.getTypeCounts(submatrix);
    if (typeCounts[TILE_TYPES.EMPTY] <= ((width * height) - 2)) {
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
 * @param {MapModel} mapModel
 * @param {Number} [width]
 * @param {Number} [height]
 * @returns {Point}
 */
export function getRandomEmptyLocation(mapModel, width = 1, height = 1) {
  const potentialLocations = getValidEmptyLocations(mapModel, width, height);
  const randomPotentialIndex = mathUtils.getRandomIntInclusive(0, potentialLocations.length - 1);
  return potentialLocations[randomPotentialIndex];
}
/**
 * tries to finds a random location and near a given TileType
 *
 * @param {MapModel} mapModel
 * @param {Number} [width]
 * @param {Number} [height]
 * @param {Number} [distance]
 * @returns {Point}
 */
export function getRandomEmptyLocationNearWalkableTile(mapModel, width = 1, height = 1, distance = 3) {
  const mapMatrix = mapModel.getMatrix();

  const potentialLocations = getValidEmptyLocations(mapModel, width, height);

  // find those who are close to a Walkable Tile
  const nearbyPotentialLocations = potentialLocations.filter((potentialPoint) => {
    const adjustedWidth = Math.floor(width / 2);
    const adjustedHeight = Math.floor(height / 2);
    const adjustedCenter = new Point(adjustedWidth, adjustedHeight);
    const adjustedPoint = potentialPoint.clone().add(adjustedCenter);
    const adjustedDistance = adjustedWidth > adjustedHeight ? (adjustedWidth + distance) : (adjustedHeight + distance);

    const nearbyPoint = getPointOfNearestWalkableType(mapMatrix, adjustedPoint, adjustedDistance);
    return nearbyPoint !== undefined;
  });

  // pick one of the valid nearby tiles
  const randomPotentialIndex = mathUtils.getRandomIntInclusive(0, nearbyPotentialLocations.length - 1);
  return nearbyPotentialLocations[randomPotentialIndex];
}
