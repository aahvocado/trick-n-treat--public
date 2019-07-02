import Point from '@studiomoniker/point';

import {TILE_ID} from 'constants.shared/tileIds';

// import CellModel from 'models.shared/CellModel';

import * as mathUtils from 'utilities.shared/mathUtils';
import * as pointUtils from 'utilities.shared/pointUtils';
import * as tileUtils from 'utilities.shared/tileUtils';

/**
 * todo
 *
 * @param {GridModel} gridModel
 * @param {Point} startingPoint
 * @param {Object} [options]
 * @property {TileId} [options.tileToUse]
 *
 * @returns {GridModel}
 */
export function generateMaze(gridModel, startingPoint = new Point(0, 0), options = {}) {
  const {
    tileToUse = TILE_ID.DEBUG.GREEN,
  } = options;

  const isCarvable = (tile) => {
    return tile === TILE_ID.EMPTY_WALL;
  };

  let iterationCount = 0;

  // keep track of points for backtracking
  const startingCell = gridModel.getAt(startingPoint);
  const path = [startingCell];
  while (path.length > 0) {
    iterationCount++;
    const currentCell = path.pop();
    const currentPoint = currentCell.get('point');
    currentCell.set({
      tile: TILE_ID.DEBUG.WHITE,
      visited: true,
    });

    // take a snapshot every third iteration
    if (iterationCount % 3 === 0) {
      gridModel.snapshot();
    }

    // find potential points that are valid when two spaces away
    const potentialPoints = [];

    const pointAbove = pointUtils.createPointAbove(currentPoint, 2);
    const cellAbove = gridModel.getAt(pointAbove);
    if (cellAbove !== undefined && cellAbove.get('visited') === false && isCarvable(cellAbove.get('tile'))) {
      potentialPoints.push(cellAbove);
    }

    const pointRight = pointUtils.createPointRight(currentPoint, 2);
    const cellRight = gridModel.getAt(pointRight);
    if (cellRight !== undefined && cellRight.get('visited') === false && isCarvable(cellRight.get('tile'))) {
      potentialPoints.push(cellRight);
    }

    const pointBelow = pointUtils.createPointBelow(currentPoint, 2);
    const cellBelow = gridModel.getAt(pointBelow);
    if (cellBelow !== undefined && cellBelow.get('visited') === false && isCarvable(cellBelow.get('tile'))) {
      potentialPoints.push(cellBelow);
    }

    const pointLeft = pointUtils.createPointLeft(currentPoint, 2);
    const cellLeft = gridModel.getAt(pointLeft);
    if (cellLeft !== undefined && cellLeft.get('visited') === false && isCarvable(cellLeft.get('tile'))) {
      potentialPoints.push(cellLeft);
    }

    // if there are no available potentialPoints, we can start backtracking
    if (potentialPoints.length <= 0) {
      currentCell.set({tile: tileToUse});

      if (path.length <= 0) {
        // console.log('. Done.');
        break;
      }

      continue;
    };

    // randomly pick one of the potential points
    const nextCell = potentialPoints[mathUtils.getRandomInt(0, potentialPoints.length - 1)];

    // current is above the next
    if (pointUtils.isPointAbove(currentCell.get('point'), nextCell.get('point'))) {
      const pointBelow1 = pointUtils.createPointBelow(currentPoint);
      const neighborBelow = gridModel.getAt(pointBelow1);
      if (neighborBelow !== undefined) {
        neighborBelow.set({
          tile: tileToUse,
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
          tile: tileToUse,
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
          tile: tileToUse,
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
          tile: tileToUse,
          visited: true,
        });
      }
    }

    // add both the 0th and 2nd cell to be available for backtracking
    path.push(currentCell);
    path.push(nextCell);

    // track history
    gridModel.snapshot();
  }

  // finished
  gridModel.snapshot();
  return gridModel;
}
/**
 * generates a maze in all available regions
 *
 * @param {GridModel} gridModel
 * @param {Object} options
 */
export function generateMazeEverywhere(gridModel, options = {}) {
  gridModel.nthCell(2, 0, (cell) => {
    const neighboringCells = gridModel.neighbors(cell.get('point'));

    // if every single cell surrounding this is a Wall, we can carve a maze through it
    const isNearExistingTile = neighboringCells.some((neighborCell) => neighborCell !== undefined && !tileUtils.isWallTile(neighborCell.get('tile')));
    if (!isNearExistingTile) {
      generateMaze(gridModel, cell.get('point'), options);
    }
  });
}
/**
 * @param {GridModel} gridModel
 * @param {Point} point
 * @param {Function} fillFunction
 * @returns {GridModel}
 */
export function floodfill(gridModel, point, fillFunction) {
  const queue = [gridModel.getAt(point)];

  while (queue.length > 0) {
    const currentCell = queue.pop();
    const currentPoint = currentCell.get('point');

    // if this tile is unfilled (which it 100% of the time should be or something went wrong), fill it
    if (!currentCell.get('filled')) {
      fillFunction(currentCell);
      currentCell.set({
        filled: true,
      });
    }

    // get the points of neighbors that are not yet filled
    const adjacentCells = gridModel.orthogonals(currentPoint)
      .filter((adjacentCell) => adjacentCell !== undefined)
      .filter((adjacentCell) => !adjacentCell.get('filled'))
      .filter((adjacentCell) => !tileUtils.isWallTile(adjacentCell.get('tile')));

    // add any unfilled neighbors to continue on to check
    queue.push(...adjacentCells);
  }

  return gridModel;
}
/**
 * @param {GridModel} gridModel
 * @returns {GridModel}
 */
export function removeDeadEnds(gridModel) {
  // start by finding dead ends on the map
  const deadendPoints = gridModel.find((cell) => {
    if (tileUtils.isWallTile(cell.get('tile'))) {
      return false;
    }

    const cellPoint = cell.get('point');
    const adjacentWalkableCells = gridModel.orthogonals(cellPoint)
      .filter((adjacentCell) => adjacentCell !== undefined)
      .filter((adjacentCell) => !tileUtils.isWallTile(adjacentCell.get('tile')));

    return adjacentWalkableCells.length === 1;
  });

  // start running through each point and their neighbors and setting them as walls
  const queue = [...deadendPoints];
  while (queue.length > 0) {
    const currentPoint = queue.pop();
    const currentCell = gridModel.getAt(currentPoint);
    currentCell.set({
      // tile: currentCell.get('tile') + 1,
      tile: TILE_ID.EMPTY_WALL,
      region: undefined,
    });

    // find that one neighbor
    const adjacentWalkableCells = gridModel.orthogonals(currentPoint)
      .filter((adjacentCell) => adjacentCell !== undefined)
      .filter((adjacentCell) => !tileUtils.isWallTile(adjacentCell.get('tile')));
    const neighborCell = adjacentWalkableCells[0];
    if (neighborCell === undefined) {
      continue;
    }

    // check if the neighbor is a dead end
    const neighborAdjacentCells = gridModel.orthogonals(neighborCell.get('point'))
      .filter((adjacentCell) => adjacentCell !== undefined)
      .filter((adjacentCell) => !tileUtils.isWallTile(adjacentCell.get('tile')));

    // add it to the queue if so
    if (neighborAdjacentCells.length === 1) {
      queue.push(neighborCell.get('point'));
    }

    gridModel.snapshot();
  }

  return gridModel;
}
