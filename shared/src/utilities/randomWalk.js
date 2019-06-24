import {TILE_ID} from 'constants.shared/tileIds';

import * as gridUtils from 'utilities.shared/gridUtils';
import * as mathUtils from 'utilities.shared/mathUtils';
import * as pointUtils from 'utilities.shared/pointUtils';

/**
 * starts the Random Walk process to apply paths to a Map
 *  https://en.wikipedia.org/wiki/Random_walk
 *
 * @param {GridModel} gridModel
 * @param {Point} point
 * @param {Number} iterations
 * @param {Object} [options]
 * @property {Number} [options.maxStepLength]
 * @property {TileId} [options.stepType]
 * @property {Boolean} [options.canOverlap]
 */
export default function randomWalk(gridModel, point, iterations, options = {}) {
  const {
    minStepLength = 3,
    maxStepLength = 5,
    stepType = TILE_ID.DEBUG.WHITE_WALL,
    canOverlap = true,
  } = options;
  // console.log('randomWalk()', iterations, '-', point.toString());

  // pick a Point which will be the direction of the next step
  const nextDirection = pointUtils.getRandomDirectionPoint();
  if (nextDirection === undefined) {
    return;
  }

  // create Tunnel (step)
  let nextPoint = point.clone();
  const tunnelLength = mathUtils.getRandomInt(minStepLength, maxStepLength);
  for (let tunnelIdx = 0; tunnelIdx < tunnelLength; tunnelIdx++) {
    // find where this tunnel would be created
    const tunnelPoint = nextPoint.clone().add(nextDirection);
    if (gridUtils.isPointOutOfBounds(gridModel.copyGrid(), tunnelPoint)) {
      break;
    }

    // get the next tile
    const nextCell = gridModel.getAt(tunnelPoint);
    const nextTile = nextCell.get('tile');

    // can stop creating tunnel if next tile would be the same and we're not allowed to overlap
    const isNextTileIdentical = nextTile === stepType;
    if (!canOverlap && isNextTileIdentical) {
      break;
    }

    // update cell at the point
    if (nextCell.get('tile') !== stepType) {
      nextCell.set({tile: stepType});
      gridModel.snapshot();
    }

    // reassign `nextPoint` to where the tunnel is
    nextPoint = tunnelPoint.clone();
  }

  // continue recursion if there are remaining steps
  if (iterations > 0) {
    randomWalk(gridModel, nextPoint, (iterations - 1), options);
  }
}
