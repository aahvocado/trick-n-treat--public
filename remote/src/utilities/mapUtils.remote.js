import Pathfinding from 'pathfinding';
import Point from '@studiomoniker/point';

import {TILE_TYPES} from 'constants/tileTypes';

import * as matrixUtils from 'utilities/matrixUtils.remote';

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
 * @param {Number} distance
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
