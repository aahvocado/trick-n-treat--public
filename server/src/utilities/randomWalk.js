import Point from '@studiomoniker/point';

import {
  TILE_TYPES,
} from 'constants/tileTypes';
import {POINTS} from 'constants/points';

import pickRandomWeightedChoice from 'utilities/pickRandomWeightedChoice';
import * as matrixUtils from 'utilities/matrixUtils';

/**
 * starts the Random Walk process to apply paths to a Map
 *  https://en.wikipedia.org/wiki/Random_walk
 *
 * @param {Matrix} matrix
 * @param {Point} currentPoint
 * @param {Number} remainingSteps
 * @param {Number} stepSize
 * @param {TileType} [stepType]
 * @returns {Path}
 */
export default function randomWalk(matrix, currentPoint, remainingSteps, stepSize, stepType = TILE_TYPES.SIDEWALK) {
  // pick a direction for the next step
  const nextDirectionPoint = getRandomWeightedDirection(matrix, currentPoint);

  // loop to handle each step covering more than one Tile
  let nextPoint = currentPoint.clone();
  for (let i = 0; i < stepSize; i++) {
    // get the next Point on the map, and check if it is a valid point on the map
    const stepPoint = nextPoint.clone().add(nextDirectionPoint);
    nextPoint = getAvailablePoint(matrix, stepPoint);

    // only update if the tile is not defined
    const nextTileType = matrixUtils.getTileAt(matrix, nextPoint);
    if (nextTileType === TILE_TYPES.EMPTY || nextTileType === null) {
      matrixUtils.setTileAt(matrix, nextPoint, stepType);
    }
  }

  // continue recursion if there are remaining steps
  if (remainingSteps > 0) {
    randomWalk(matrix, nextPoint, (remainingSteps - 1), stepSize, stepType);
  }
}
/**
 * creates a Point that indicates a direction to go
 *  but weighted based on how close they are to the edge of the Matrix
 *
 * @param {Matrix} matrix
 * @param {Point} point
 * @returns {Point}
 */
function getRandomWeightedDirection(matrix, point) {
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
 * checks if given Point is a valid point
 *  and loops around if it was out of bounds
 *
 * @param {Matrix} matrix
 * @param {Point} point
 * @param {Boolean} [canLoop]
 * @returns {Point}
 */
function getAvailablePoint(matrix, point, canLoop = false) {
  let {x, y} = point;

  const leftBounds = 0;
  const rightBounds = matrixUtils.getWidth(matrix) - 1;
  const topBounds = 0;
  const bottomBounds = matrixUtils.getHeight(matrix) - 1;

  // handle loopable pathing
  if (canLoop) {
    if (x > rightBounds) {
      x = leftBounds;
    } else if (x < leftBounds) {
      x = rightBounds;
    }

    if (y > bottomBounds) {
      y = topBounds;
    } else if (y < topBounds) {
      y = bottomBounds;
    }

    return new Point(x, y);
  }

  // constrained pathing - return the boundary if the point is beyond it
  if (x > rightBounds) {
    x = rightBounds;
  } else if (x < leftBounds) {
    x = leftBounds;
  }

  if (y > bottomBounds) {
    y = bottomBounds;
  } else if (y < topBounds) {
    y = topBounds;
  }

  return new Point(x, y);
}
