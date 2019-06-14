import Pathfinding from 'pathfinding';
import Point from '@studiomoniker/point';

import {POINTS} from 'constants.shared/points';
import {TILE_TYPES} from 'constants.shared/tileTypes';

import MatrixModel from 'models.shared/MatrixModel';

import pickRandomWeightedChoice from 'utilities.shared/pickRandomWeightedChoice';
import * as mathUtils from 'utilities.shared/mathUtils';
import * as matrixUtils from 'utilities.shared/matrixUtils';
import * as tileTypeUtils from 'utilities.shared/tileTypeUtils';

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
 * @returns {Grid}
 */
export function createGridForPathfinding(matrix) {
  return new Pathfinding.Grid(matrixUtils.map(matrix, (tileType, point) => {
    // treat walkable tiles as pathable
    if (tileTypeUtils.isWalkableTile(tileType)) {
      return 0;
    }

    // everything else is walls
    return 1;
  }));
}
/**
 * creates pathfinding grid where walkable tiles are walls
 *
 * @param {Matrix} matrix
 * @returns {Grid}
 */
export function createGridForConnecting(matrix) {
  return new Pathfinding.Grid(matrixUtils.map(matrix, (tileType, point) => {
    // treat walkable tiles as Walls
    if (tileTypeUtils.isWalkableTile(tileType)) {
      return 1;
    }

    // can be pathed
    return 0;
  }));
}
/**
 * only treat walls as walls
 *
 * @param {Matrix} matrix
 * @returns {Grid}
 */
export function createGridForLighting(matrix) {
  return new Pathfinding.Grid(matrixUtils.map(matrix, (tileType, point) => {
    // wow there are wall tiles
    if (tileTypeUtils.isWallTile(tileType)) {
      return 1;
    }

    // can be pathed
    return 0;
  }));
}
/**
 * uses a* algo to find the path between two points
 *
 * @param {Grid} grid
 * @param {Point} startPoint
 * @param {Point} endPoint
 * @returns {Path}
 */
export function getAStarPath(grid, startPoint, endPoint) {
  const finder = new Pathfinding.AStarFinder();
  const coordinatePath = finder.findPath(startPoint.x, startPoint.y, endPoint.x, endPoint.y, grid);

  // finder gives us Array of Array [x, y] - we'll convert it to a more convenient Array<Point>
  const pointPath = coordinatePath.map((coordinate) => (new Point(coordinate[0], coordinate[1])));
  return pointPath;
}
/**
 * find distance between two points using a given grid for pathfinding
 *  a return value of -1 means it could not be reached
 *
 * @param {Grid} grid
 * @param {Point} startPoint
 * @param {Point} endPoint
 * @returns {Number}
 */
export function getPathDistance(grid, startPoint, endPoint) {
  const pointPath = getAStarPath(grid, startPoint, endPoint);
  return pointPath.length - 1;
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

  const grid = createGridForConnecting(matrix);
  const aStarPath = getAStarPath(grid, startPoint, endPoint);
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
  const grid = createGridForPathfinding(matrix);
  const path = getAStarPath(grid, startPoint, endPoint);

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
    const grid = createGridForPathfinding(matrix);
    const path = getAStarPath(grid, startPoint, tilePoint);

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
// -- utilities
/**
 * @param {Matrix} matrix
 * @param {Point} point
 * @returns {Boolean}
 */
export function isWalkableAt(matrix, point) {
  const foundTile = matrixUtils.getTileAt(matrix, point);
  if (foundTile === undefined) {
    return false;
  }

  return tileTypeUtils.isWalkableTile(foundTile);
}
/**
 * gets a point in a random direction that is not a wall or off map
 *
 * @param {Matrix} matrix
 * @param {Point} point
 * @returns {Point}
 */
export function getRandomDirection(matrix, point) {
  const tileLeft = matrixUtils.getTileLeft(matrix, point);
  const isLeftAvailable = tileLeft !== undefined && !tileTypeUtils.isWallTile(tileLeft);

  const tileRight = matrixUtils.getTileRight(matrix, point);
  const isRightAvailable = tileRight !== undefined && !tileTypeUtils.isWallTile(tileRight);

  const tileAbove = matrixUtils.getTileAbove(matrix, point);
  const isAboveAvailable = tileAbove !== undefined && !tileTypeUtils.isWallTile(tileAbove);

  const tileBelow = matrixUtils.getTileBelow(matrix, point);
  const isBelowAvailable = tileBelow !== undefined && !tileTypeUtils.isWallTile(tileBelow);

  // everything is unavailable
  if (!isLeftAvailable && !isRightAvailable && !isAboveAvailable && !isBelowAvailable) {
    return undefined;
  }

  const choiceList = [
    {
      returns: POINTS.LEFT.clone(),
      weight: isLeftAvailable ? 1 : 0,
    }, {
      returns: POINTS.RIGHT.clone(),
      weight: isRightAvailable ? 1 : 0,
    }, {
      returns: POINTS.UP.clone(),
      weight: isAboveAvailable ? 1 : 0,
    }, {
      returns: POINTS.DOWN.clone(),
      weight: isBelowAvailable ? 1 : 0,
    },
  ];

  return pickRandomWeightedChoice(choiceList);
}
/**
 * creates a Point that indicates a direction to go
 *  but weighted based on how close they are to the edge of the Matrix
 *
 * @param {Matrix} matrix
 * @param {Point} point
 * @returns {Point}
 */
export function getRandomWeightedDirection(matrix, point) {
  // anonymous function to calculate adjust weight
  const calculateWeight = (val) => {
    return Math.pow((val * 100), 2);
  };

  // wip set up some variables
  const xMaxIdx = matrix[0].length - 1;
  const yMaxIdx = matrix.length - 1;

  const distanceFromLeft = point.x;
  const distanceFromRight = xMaxIdx - point.x;
  const distanceFromTop = point.y;
  const distanceFromBottom = yMaxIdx - point.y;

  // pick a direction based on its weight
  return pickRandomWeightedChoice([
    {
      returns: POINTS.LEFT.clone(),
      weight: calculateWeight(distanceFromLeft / xMaxIdx),
    }, {
      returns: POINTS.RIGHT.clone(),
      weight: calculateWeight(distanceFromRight / xMaxIdx),
    }, {
      returns: POINTS.UP.clone(),
      weight: calculateWeight(distanceFromTop / yMaxIdx),
    }, {
      returns: POINTS.DOWN.clone(),
      weight: calculateWeight(distanceFromBottom / yMaxIdx),
    },
  ]);
}
/**
 * returns neighboring points immediately adjacent that are not walls
 *
 * @param {Matrix} matrix
 * @param {Point} point - where to start looking from
 * @returns {Array<Point>}
 */
export function getNonWallNeighboringPoints(matrix, point) {
  const neighboringPoints = [];

  const pointAbove = pointUtils.createPointAbove(point);
  const tileAbove = matrixUtils.getTileAbove(matrix, pointAbove);
  if (tileAbove !== undefined && !tileTypeUtils.isWallTile(tileAbove)) {
    neighboringPoints.push(pointAbove);
  }

  const pointRight = pointUtils.createPointRight(point);
  const tileRight = matrixUtils.getTileRight(matrix, pointRight);
  if (tileRight !== undefined && !tileTypeUtils.isWallTile(tileRight)) {
    neighboringPoints.push(pointRight);
  }

  const pointBelow = pointUtils.createPointBelow(point);
  const tileBelow = matrixUtils.getTileBelow(matrix, pointBelow);
  if (tileBelow !== undefined && !tileTypeUtils.isWallTile(tileBelow)) {
    neighboringPoints.push(pointBelow);
  }

  const pointLeft = pointUtils.createPointLeft(point);
  const tileLeft = matrixUtils.getTileLeft(matrix, pointLeft);
  if (tileLeft !== undefined && !tileTypeUtils.isWallTile(tileLeft)) {
    neighboringPoints.push(pointLeft);
  }

  return neighboringPoints;
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
 * finds if there is a TileType that is within path distance
 *
 * @param {Matrix} matrix
 * @param {Point} startPoint
 * @param {TileType} tileType
 * @param {Number} distance
 * @returns {Boolean}
 */
export function hasTypeNearbyOnPath(matrix, startPoint, tileType, distance) {
  const nearbyPoints = getPointOfNearestWalkableType(matrix, startPoint, distance);
  return nearbyPoints.some((point) => (matrixUtils.isTileEqualTo(matrix, point, tileType)));
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
    tileTypeUtils.isWalkableTile(tileType) && matrixUtils.getDistanceBetween(startPoint, tilePoint) <= distance
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
    const emptyCount = typeCounts[TILE_TYPES.EMPTY];
    if (emptyCount === undefined || emptyCount < (width * height)) {
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
 * @param {Number} [attempts]
 * @returns {Point}
 */
export function getRandomEmptyLocation(matrix, width, height, attempts) {
  const calculatedAttempts = attempts || Math.ceil(width * height * 0.66);
  const matrixWidth = matrixUtils.getWidth(matrix);
  const matrixHeight = matrixUtils.getHeight(matrix);

  // let foundPoint = undefined;
  for (let i=0; i<calculatedAttempts; i++) {
    const randomPoint = new Point(
      mathUtils.getRandomIntInclusive(0, matrixWidth - width),
      mathUtils.getRandomIntInclusive(0, matrixHeight - height),
    );

    // will this fit?
    const topLeftPoint = new Point(randomPoint.x, randomPoint.y);
    const bottomRightPoint = new Point(randomPoint.x + width - 1, randomPoint.y + height - 1);
    const submatrix = matrixUtils.getSubmatrixSquare(matrix, topLeftPoint, bottomRightPoint);
    if (submatrix === undefined || matrixUtils.getHeight(submatrix) < height || matrixUtils.getWidth(submatrix) < width) {
      continue;
    }

    // are is this intersecting a wall?
    const hasAnyWalls = matrixUtils.some(submatrix, (tileType) => {
      return tileTypeUtils.isWallTile(tileType);
    });
    if (hasAnyWalls) {
      continue;
    }

    // viable location
    return randomPoint;
  }
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
export function getPointsAdjacentToWalkableTile(matrix, width = 1, height = 1, distance = 3) {
  const potentialLocations = getValidEmptyLocations(matrix, width, height);

  // find the center point of the potential area
  const adjustedCenter = new Point(Math.floor((width - 1) / 2), Math.floor((height - 1) / 2));

  // find those who are close to a Walkable Tile
  const pointsAdjacentToWalkableTileList = potentialLocations.filter((potentialPoint) => {
    const adjustedPoint = potentialPoint.clone().add(adjustedCenter.clone());
    const adjustedDistance = adjustedCenter.x > adjustedCenter.y ? (adjustedCenter.clone().x + distance) : (adjustedCenter.clone().y + distance);

    const nearbyPoint = getPointOfNearestWalkableType(matrix, adjustedPoint, adjustedDistance);
    return nearbyPoint !== undefined;
  });

  return pointsAdjacentToWalkableTileList;
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
  const pointsAdjacentToWalkableTileList = getPointsAdjacentToWalkableTile(matrix, width, height, distance);

  // pick one of the valid nearby tiles
  const randomPotentialIndex = mathUtils.getRandomIntInclusive(0, pointsAdjacentToWalkableTileList.length - 1);
  return pointsAdjacentToWalkableTileList[randomPotentialIndex];
}
/**
 * checks if given point is the border in a map
 *
 * determined by looking at each point's neighbor,
 *  if they are surrounded by all walkable tiles, then it is not a border
 *
 * @param {Matrix} matrix
 * @param {Point} point
 * @returns {Boolean}
 */
export function isBorderPoint(matrix, point) {
  const matrixModel = new MatrixModel({matrix: matrix});

  // if this tile is not walkable, we don't need to do any other checks
  const tileType = matrixModel.getTileAt(point);
  if (!tileTypeUtils.isWalkableTile(tileType)) {
    return false;
  }

  // check if surrounding tiles are walkable
  //  and account for being at a corner/edge of the matrix
  const leftTile = matrixModel.getTileLeft(point);
  const hasLeftWalkable = tileTypeUtils.isWalkableTile(leftTile) && leftTile !== undefined;

  const rightTile = matrixModel.getTileRight(point);
  const hasRightWalkable = tileTypeUtils.isWalkableTile(rightTile) && rightTile !== undefined;

  const aboveTile = matrixModel.getTileAbove(point);
  const hasAboveWalkable = tileTypeUtils.isWalkableTile(aboveTile) && aboveTile !== undefined;

  const belowTile = matrixModel.getTileBelow(point);
  const hasBelowWalkable = tileTypeUtils.isWalkableTile(belowTile) && belowTile !== undefined;

  // count how many walkable tiles this is adjacent to
  const adjacentWalkableCount = [hasLeftWalkable, hasRightWalkable, hasAboveWalkable, hasBelowWalkable].filter(Boolean).length;

  // is a border if it's not completely surrounded or alone
  if (adjacentWalkableCount <= 3 && adjacentWalkableCount > 0) {
    return true;
  }

  return false;
}
/**
 * finds Path points that surround the map
 *
 * @param {Matrix} matrix
 * @returns {Array<Point>}
 */
export function getBorderPoints(matrix) {
  let borderPointsList = [];

  const matrixModel = new MatrixModel({matrix: matrix});
  matrixModel.forEach((tileType, tilePoint) => {
    if (isBorderPoint(matrix, tilePoint)) {
      borderPointsList.push(tilePoint);
    }
  });

  return borderPointsList;
}
