import Point from '@studiomoniker/point';

import {TILE_TYPES} from 'constants.shared/tileTypes';
import {POINTS} from 'constants.shared/points';

import pickRandomWeightedChoice from 'utilities.shared/pickRandomWeightedChoice';
import * as mapUtils from 'utilities.shared/mapUtils';
import * as mathUtils from 'utilities.shared/mathUtils';
import * as matrixUtils from 'utilities.shared/matrixUtils';
import * as pointUtils from 'utilities.shared/pointUtils';
import * as tileTypeUtils from 'utilities.shared/tileTypeUtils';

/**
 * starts the Random Walk process to apply paths to a Map
 *  https://en.wikipedia.org/wiki/Random_walk
 *
 * @param {Matrix} matrix
 * @param {Point} point
 * @param {Number} iterations
 * @param {Object} [options]
 * @property {Number} [options.maxStepLength]
 * @property {Number} [options.stepWidth]
 * @property {TileType} [options.stepType]
 * @property {Boolean} [options.canOverlap]
 * @property {Boolean} [options.useWeightedDirection]
 */
export default function randomWalk(matrix, point, iterations, options = {}) {
  const {
    maxStepLength = 5,
    stepWidth = 1,
    stepType = TILE_TYPES.DEBUG_WALL_WHITE,
    canOverlap = true,
    useWeightedDirection = false,
  } = options;
  // console.log('randomWalk()', iterations, '-', point.toString());

  // pick a Point which will be the direction of the next step
  const nextDirection = (() => {
    // weighted - prefer a direction that is farther away from the edge of the map
    if (useWeightedDirection) {
      return getRandomWeightedDirection(matrix, point);;
    }

    // random direction
    return pointUtils.getRandomDirectionPoint();
  })();

  // `undefined` means we've reached a dead end
  if (nextDirection === undefined) {
    return;
  }

  // create Tunnel (step)
  let nextPoint = point.clone();
  const tunnelLength = mathUtils.getRandomIntInclusive(3, maxStepLength);
  for (let tunnelIdx = 0; tunnelIdx < tunnelLength; tunnelIdx++) {
    // find where this tunnel would be created
    const tunnelPoint = nextPoint.clone().add(nextDirection);

    // stop if we are about to hit an edge
    const nextTile = matrixUtils.getTileAt(matrix, tunnelPoint);
    if (nextTile === undefined) {
      break;
    }

    // stop if we we will hit a wall and are not allowed overlapping
    if (tileTypeUtils.isWallTile(nextTile) && !canOverlap) {
      break;
    }

    // if we can overlap, only overlap with the same type
    if (tileTypeUtils.isWallTile(nextTile) && nextTile !== stepType && canOverlap) {
      break;
    }

    // reassign `nextPoint` to where the tunnel is
    nextPoint = tunnelPoint.clone();

    // set
    matrixUtils.setTileAt(matrix, tunnelPoint, stepType);
  }

  // continue recursion if there are remaining steps
  if (iterations > 0) {
    randomWalk(matrix, nextPoint, (iterations - 1), options);
  }
}
