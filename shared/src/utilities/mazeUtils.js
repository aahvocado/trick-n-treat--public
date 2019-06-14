import Point from '@studiomoniker/point';

import {TILE_TYPES} from 'constants.shared/tileTypes';
import {POINTS} from 'constants.shared/points';

import MapModel from 'models.shared/MapModel';
import CellModel from 'models.shared/CellModel';

import convertObservableToJs from 'utilities.shared/convertObservableToJs';
import pickRandomWeightedChoice from 'utilities.shared/pickRandomWeightedChoice';
import * as mapUtils from 'utilities.shared/mapUtils';
import * as mathUtils from 'utilities.shared/mathUtils';
import * as matrixUtils from 'utilities.shared/matrixUtils';
import * as pointUtils from 'utilities.shared/pointUtils';
import * as tileTypeUtils from 'utilities.shared/tileTypeUtils';

/**
 * @param {Matrix} matrix
 * @returns {MapModel}
 */
export function convertMatrixToMaze(matrix) {
  const mazeMatrix = matrixUtils.map(matrix, (tileType, point) => {
    // if the tile is a wall - get a `visited: true` cell
    if (tileTypeUtils.isWallTile(tileType)) {
      return new CellModel({
        point: point,
        visited: true,
        tileType: tileType,
        top: matrixUtils.getTileAbove(matrix, point) === undefined || matrixUtils.getTileAbove(matrix, point) !== tileType,
        left: matrixUtils.getTileLeft(matrix, point) === undefined || matrixUtils.getTileLeft(matrix, point) !== tileType,
        bottom: matrixUtils.getTileBelow(matrix, point) === undefined || matrixUtils.getTileBelow(matrix, point) !== tileType,
        right: matrixUtils.getTileRight(matrix, point) === undefined || matrixUtils.getTileRight(matrix, point) !== tileType,
      });
    }

    return new CellModel({point: point});
  });

  return new MapModel({matrix: mazeMatrix});
}
/**
 * creates a perfect maze using depth-first method
 * @link https://github.com/dstromberg2/maze-generator
 *
 * @param {MapModel} mazeModel
 * @param {Point} point
 * @param {Object} [options]
 * @property {Number} [options.maxTunnelLength]
 * @property {TileType} [options.stepType]
 *
 * @returns {MapModel}
 */
export function depthFirstMaze(mazeModel, point, options = {}) {
  const {
    maxTunnelLength = 5,
    stepType = TILE_TYPES.DEBUG_WALL_WHITE,
  } = options;

  let currentPoint = point.clone();
  const startingCell = mazeModel.getTileAt(currentPoint);
  const path = [currentPoint];

  let remainingCells = mazeModel.getUnvisitedCount();
  while (remainingCells > 0) {
    const currentCell = mazeModel.getTileAt(currentPoint);
    const neighbors = mazeModel.getNeighborsAt(currentPoint).filter((cell) => cell && !cell.get('visited'));

    // if there are no available neighbors, we can start backtracking
    if (neighbors.length <= 0) {
      if (path.length <= 0) {
        console.error('This maze has unreachable parts.');
        break;
      }

      currentPoint = path.pop();
      continue;
    };

    // our next cell is randomly one of the available neighboring cells
    const nextCell = neighbors[mathUtils.getRandomIntInclusive(0, neighbors.length - 1)];
    nextCell.set({
      visited: true,
      tileType: stepType,
    });

    // one less cell to check
    remainingCells --;

    // current is above the next
    if (pointUtils.isPointAbove(currentCell.get('point'), nextCell.get('point'))) {
      currentCell.set({bottom: false});
      nextCell.set({top: false});
    }
    // current is to the right of next
    if (pointUtils.isPointRight(currentCell.get('point'), nextCell.get('point'))) {
      currentCell.set({left: false});
      nextCell.set({right: false});
    }
    // current is to the left of next
    if (pointUtils.isPointLeft(currentCell.get('point'), nextCell.get('point'))) {
      currentCell.set({right: false});
      nextCell.set({left: false});
    }
    // current is below the next
    if (pointUtils.isPointBelow(currentCell.get('point'), nextCell.get('point'))) {
      currentCell.set({top: false});
      nextCell.set({bottom: false});
    }

    // add current point to path
    path.push(currentPoint);

    // then continue to check with the point we chose
    currentPoint = nextCell.get('point');
    mazeModel.get('mapHistory').push(mazeModel.export());
  };

  return mazeModel;
}
/**
 * opens the different regions to the maze
 * @link https://github.com/dstromberg2/maze-generator
 *
 * @param {MapModel} mazeModel
 * @param {Object} [options]
 * @property {Number} [options.numToOpen]
 */
export function openRegions(mazeModel, options = {}) {
  const {
    numToOpen = 10,
  } = options;
  const breakdownFunctions = [];

  // go through each cell and see if one their adjacent walls
  //  is next to a cell of a different region,
  //  if so, then it can be opened up
  mazeModel.forEach((cell, point) => {
    const myTileType = cell.get('tileType');

    if (cell.get('top')) {
      const cellAbove = mazeModel.getTileAbove(point);
      if (cellAbove !== undefined) {
        const tileTypeAbove = cellAbove.get('tileType');
        if (myTileType !== tileTypeAbove) {
          breakdownFunctions.push(() => {
            if (!cell.get('hasBreakdown') && !cellAbove.get('hasBreakdown')) {
              cell.set({
                top: false,
                tileType: tileTypeAbove,
                hasBreakdown: true,
              });
              cellAbove.set({
                bottom: false,
                hasBreakdown: true,
              });
            }
          });
        }
      }
    }

    if (cell.get('right')) {
      const cellRight = mazeModel.getTileRight(point);
      if (cellRight !== undefined) {
        const tileTypeRight = cellRight.get('tileType');
        if (myTileType !== tileTypeRight) {
          breakdownFunctions.push(() => {
            if (!cell.get('hasBreakdown') && !cellRight.get('hasBreakdown')) {
              cell.set({
                right: false,
                tileType: tileTypeRight,
                hasBreakdown: true,
              });
              cellRight.set({
                left: false,
                hasBreakdown: true,
              });
            }
          });
        }
      }
    }

    if (cell.get('bottom')) {
      const cellBelow = mazeModel.getTileBelow(point);
      if (cellBelow !== undefined) {
        const tileTypeBelow = cellBelow.get('tileType');
        if (myTileType !== tileTypeBelow) {
          breakdownFunctions.push(() => {
            if (!cell.get('hasBreakdown') && !cellBelow.get('hasBreakdown')) {
              cell.set({
                bottom: false,
                tileType: tileTypeBelow,
                hasBreakdown: true,
              });
              cellBelow.set({
                top: false,
                hasBreakdown: true,
              });
            }
          });
        }
      }
    }

    if (cell.get('left')) {
      const cellLeft = mazeModel.getTileLeft(point);
      if (cellLeft !== undefined) {
        const tileTypeLeft = cellLeft.get('tileType');
        if (myTileType !== tileTypeLeft) {
          breakdownFunctions.push(() => {
            if (!cell.get('hasBreakdown') && !cellLeft.get('hasBreakdown')) {
              cell.set({
                left: false,
                tileType: tileTypeLeft,
                hasBreakdown: true,
              });
              cellLeft.set({
                right: false,
                hasBreakdown: true,
              });
            }
          });
        }
      }
    }
  });

  // pick one of the valid walls to breakdown
  for (let w=0; w<numToOpen; w++) {
    // no more regions
    if (breakdownFunctions.length <= 0) {
      break;
    }

    // pick a random cell that we will break the walls between
    const randomIdx = mathUtils.getRandomIntInclusive(0, breakdownFunctions.length - 1);
    if (randomIdx >= 0) {
      breakdownFunctions.splice(randomIdx, 1)[0]();
      mazeModel.get('mapHistory').push(mazeModel.export());
    }
  }
}
/**
 * @param {MapModel} maze
 * @param {Point} point
 * @param {TileType} tileType
 * @returns {MapModel}
 */
export function floodfill(maze, point, tileType) {
  const queue = [point];

  while (queue.length > 0) {
    const currentPoint = queue.pop();
    const cell = maze.getTileAt(currentPoint);

    // if this tile is unfilled (which it 100% of the time should be or something went wrong), fill it
    if (!cell.get('filled')) {
      cell.set({
        tileType: tileType,
        filled: true,
      });
    }

    // get the points of neighbors that are not yet filled
    const unfilledNeighbors = [];
    maze.getNonWalledNeighbors(currentPoint).forEach((checkCell) => {
      if (!checkCell.get('filled')) {
        unfilledNeighbors.push(checkCell.get('point'));
      }
    });

    // add any unfilled neighbors to continue on to check
    queue.push(...unfilledNeighbors);

    maze.get('mapHistory').push(maze.export());
  }

  return maze;
}
/**
 * ?
 *
 * @param {MapModel} mazeModel
 * @param {Point} point
 * @param {Object} [options]
 * @property {TileType} [options.stepType]
 *
 * @returns {MapModel}
 */
export function oddMaze(mazeModel, point, options = {}) {
  const {
    // stepType = TILE_TYPES.DEBUG_WALL_WHITE,
  } = options;

  // keep track of points for backtracking
  const startingCell = mazeModel.getTileAt(point);
  const path = [startingCell];
  while (path.length > 0) {
    const currentCell = path.pop();
    const currentPoint = currentCell.get('point');
    currentCell.set({
      tileType: TILE_TYPES.DEBUG_WALL_WHITE,
      visited: true,
    });
    mazeModel.get('mapHistory').push(mazeModel.export());

    // find potential points that are valid when two spaces away
    const potentialPoints = [];

    const pointAbove = pointUtils.createPointAbove(currentPoint, 2);
    const cellAbove = mazeModel.getTileAt(pointAbove);
    if (cellAbove !== undefined && cellAbove.get('visited') === false && !tileTypeUtils.isWallTile(cellAbove.get('tileType'))) {
      potentialPoints.push(cellAbove);
    }

    const pointRight = pointUtils.createPointRight(currentPoint, 2);
    const cellRight = mazeModel.getTileAt(pointRight);
    if (cellRight !== undefined && cellRight.get('visited') === false && !tileTypeUtils.isWallTile(cellRight.get('tileType'))) {
      potentialPoints.push(cellRight);
    }

    const pointBelow = pointUtils.createPointBelow(currentPoint, 2);
    const cellBelow = mazeModel.getTileAt(pointBelow);
    if (cellBelow !== undefined && cellBelow.get('visited') === false && !tileTypeUtils.isWallTile(cellBelow.get('tileType'))) {
      potentialPoints.push(cellBelow);
    }

    const pointLeft = pointUtils.createPointLeft(currentPoint, 2);
    const cellLeft = mazeModel.getTileAt(pointLeft);
    if (cellLeft !== undefined && cellLeft.get('visited') === false && !tileTypeUtils.isWallTile(cellLeft.get('tileType'))) {
      potentialPoints.push(cellLeft);
    }

    // if there are no available potentialPoints, we can start backtracking
    if (potentialPoints.length <= 0) {
      currentCell.set({tileType: TILE_TYPES.DEBUG_WALL_GREEN});

      if (path.length <= 0) {
        console.log('. Done.');
        break;
      }

      continue;
    };

    // randomly pick one of the potential points
    const nextCell = potentialPoints[mathUtils.getRandomIntInclusive(0, potentialPoints.length - 1)];

    // current is above the next
    if (pointUtils.isPointAbove(currentCell.get('point'), nextCell.get('point'))) {
      const neighborBelow = mazeModel.getTileBelow(currentCell.get('point'));
      if (neighborBelow !== undefined) {
        neighborBelow.set({
          tileType: TILE_TYPES.DEBUG_WALL_GREEN,
          visited: true,
        });
      }
    }
    // current is to the right of next
    if (pointUtils.isPointRight(currentCell.get('point'), nextCell.get('point'))) {
      const neighborLeft = mazeModel.getTileLeft(currentCell.get('point'));
      if (neighborLeft !== undefined) {
        neighborLeft.set({
          tileType: TILE_TYPES.DEBUG_WALL_GREEN,
          visited: true,
        });
      }
    }
    // current is below the next
    if (pointUtils.isPointBelow(currentCell.get('point'), nextCell.get('point'))) {
      const neighborAbove = mazeModel.getTileAbove(currentCell.get('point'));
      if (neighborAbove !== undefined) {
        neighborAbove.set({
          tileType: TILE_TYPES.DEBUG_WALL_GREEN,
          visited: true,
        });
      }
    }
    // current is to the left of next
    if (pointUtils.isPointLeft(currentCell.get('point'), nextCell.get('point'))) {
      const neighborRight = mazeModel.getTileRight(currentCell.get('point'));
      if (neighborRight !== undefined) {
        neighborRight.set({
          tileType: TILE_TYPES.DEBUG_WALL_GREEN,
          visited: true,
        });
      }
    }

    // add both the 0th and 2nd cell to be available for backtracking
    path.push(currentCell);
    path.push(nextCell);

    // track history
    mazeModel.get('mapHistory').push(mazeModel.export());
  }

  // finished
  mazeModel.get('mapHistory').push(mazeModel.export());
  return mazeModel;
}
