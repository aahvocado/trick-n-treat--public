import Point from '@studiomoniker/point';

import {TILE_TYPES} from 'constants.shared/tileTypes';
import {POINTS} from 'constants.shared/points';

import CellModel from 'models.shared/CellModel';

// import randomizeArray from 'utilities.shared/randomizeArray';
import convertObservableToJs from 'utilities.shared/convertObservableToJs';
import pickRandomWeightedChoice from 'utilities.shared/pickRandomWeightedChoice';
import * as mapUtils from 'utilities.shared/mapUtils';
import * as mathUtils from 'utilities.shared/mathUtils';
import * as matrixUtils from 'utilities.shared/matrixUtils';
import * as pointUtils from 'utilities.shared/pointUtils';
import * as tileTypeUtils from 'utilities.shared/tileTypeUtils';

/**
 * todo
 *
 * @param {GridModel} gridModel
 * @param {Point} startingPoint
 * @param {Object} [options]
 * @property {TileType} [options.stepType]
 *
 * @returns {GridModel}
 */
export function generateMaze(gridModel, startingPoint, options = {}) {
  const {
    // stepType = TILE_TYPES.DEBUG_WALL_WHITE,
  } = options;

  // keep track of points for backtracking
  const startingCell = gridModel.getAt(startingPoint);
  const path = [startingCell];
  while (path.length > 0) {
    const currentCell = path.pop();
    const currentPoint = currentCell.get('point');
    currentCell.set({
      tileType: TILE_TYPES.DEBUG_WHITE,
      visited: true,
    });
    gridModel.snapshot();

    // find potential points that are valid when two spaces away
    const potentialPoints = [];

    const pointAbove = pointUtils.createPointAbove(currentPoint, 2);
    const cellAbove = gridModel.getAt(pointAbove);
    if (cellAbove !== undefined && cellAbove.get('visited') === false && tileTypeUtils.isWallTile(cellAbove.get('tileType'))) {
      potentialPoints.push(cellAbove);
    }

    const pointRight = pointUtils.createPointRight(currentPoint, 2);
    const cellRight = gridModel.getAt(pointRight);
    if (cellRight !== undefined && cellRight.get('visited') === false && tileTypeUtils.isWallTile(cellRight.get('tileType'))) {
      potentialPoints.push(cellRight);
    }

    const pointBelow = pointUtils.createPointBelow(currentPoint, 2);
    const cellBelow = gridModel.getAt(pointBelow);
    if (cellBelow !== undefined && cellBelow.get('visited') === false && tileTypeUtils.isWallTile(cellBelow.get('tileType'))) {
      potentialPoints.push(cellBelow);
    }

    const pointLeft = pointUtils.createPointLeft(currentPoint, 2);
    const cellLeft = gridModel.getAt(pointLeft);
    if (cellLeft !== undefined && cellLeft.get('visited') === false && tileTypeUtils.isWallTile(cellLeft.get('tileType'))) {
      potentialPoints.push(cellLeft);
    }

    // if there are no available potentialPoints, we can start backtracking
    if (potentialPoints.length <= 0) {
      currentCell.set({tileType: TILE_TYPES.DEBUG_GREEN});

      if (path.length <= 0) {
        // console.log('. Done.');
        break;
      }

      continue;
    };

    // randomly pick one of the potential points
    const nextCell = potentialPoints[mathUtils.getRandomIntInclusive(0, potentialPoints.length - 1)];

    // current is above the next
    if (pointUtils.isPointAbove(currentCell.get('point'), nextCell.get('point'))) {
      const pointBelow1 = pointUtils.createPointBelow(currentPoint);
      const neighborBelow = gridModel.getAt(pointBelow1);
      if (neighborBelow !== undefined) {
        neighborBelow.set({
          tileType: TILE_TYPES.DEBUG_GREEN,
          visited: true,
        });
      }
    }
    // current is to the right of next
    if (pointUtils.isPointRight(currentCell.get('point'), nextCell.get('point'))) {
      const pointLeft1 = pointUtils.createPointLeft(currentPoint);
      const neighborLeft = gridModel.getAt(pointLeft1);
      if (neighborLeft !== undefined) {
        neighborLeft.set({
          tileType: TILE_TYPES.DEBUG_GREEN,
          visited: true,
        });
      }
    }
    // current is below the next
    if (pointUtils.isPointBelow(currentCell.get('point'), nextCell.get('point'))) {
      const pointAbove1 = pointUtils.createPointAbove(currentPoint);
      const neighborAbove = gridModel.getAt(pointAbove1);
      if (neighborAbove !== undefined) {
        neighborAbove.set({
          tileType: TILE_TYPES.DEBUG_GREEN,
          visited: true,
        });
      }
    }
    // current is to the left of next
    if (pointUtils.isPointLeft(currentCell.get('point'), nextCell.get('point'))) {
      const pointRight1 = pointUtils.createPointRight(currentPoint);
      const neighborRight = gridModel.getAt(pointRight1);
      if (neighborRight !== undefined) {
        neighborRight.set({
          tileType: TILE_TYPES.DEBUG_GREEN,
          visited: true,
        });
      }
    }

    // add both the 0th and 2nd cell to be available for backtracking
    path.push(currentCell);
    path.push(nextCell);

    // track history
    gridModel.snapshot()
  }

  // finished
  gridModel.snapshot()
  return gridModel;
}
/**
 * opens the different regions to the maze
 * @link https://github.com/dstromberg2/maze-generator
 *
 * @param {GridModel} gridModel
 * @param {Object} [options]
 * @property {Number} [options.numToOpen]
 */
export function connectRegions(gridModel, options = {}) {
  const {
    numToOpen = 10,
  } = options;

  const possibleConnectors = [];

  // go through each cell and see if one their adjacent walls
  //  is next to a cell of a different region,
  //  if so, then it can be opened up
  gridModel.forEach((cell) => {
    const point = cell.get('point');
    const tile = cell.get('tileType');

    // only walls can become connectors
    if (!tileTypeUtils.isWallTile(tile)) {
      return;
    }

    // find the tiles adjacent to this that are not walls
    const adjacentTiles = gridModel.getAdjacent(point)
      .map((adjacentCell) => adjacentCell.get('tileType'))
      .filter((adjacentTile) => !tileTypeUtils.isWallTile(adjacentTile));

    // find unique tiles (which represent unique regions),
    //  and it can be a connector if there are at least two unique regions
    const distinctTiles = new Set(adjacentTiles);
    if (distinctTiles.size >= 2) {
      possibleConnectors.push(cell);
    };
  });

  // make note of it
  possibleConnectors.forEach((possibleCell) => {
    possibleCell.set({tileType: TILE_TYPES.DEBUG_WALL_BLUE});
  });
}
