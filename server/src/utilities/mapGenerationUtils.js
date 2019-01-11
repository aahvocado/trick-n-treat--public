import Point from '@studiomoniker/point';
import MapModel from 'models/MapModel';

import { getRandomIntInclusive } from 'utilities/mathUtils';

/**
 * documentation for types
 *
 * @typedef {Array<Array>} Map
 *
 * @typedef {Object} MapConfig
 * @property {Number} MapConfig.width - number of horizontal tiles
 * @property {Number} MapConfig.height - number of vertical tiles
 * @property {Number} MapConfig.numSpecials - number of special tiles
 */

/**
 * goes through the entire generation process
 *
 * @param {MapConfig} mapConfig
 * @returns {MapModel}
 */
export function generateNewMapModel(mapConfig) {
  const emptyMap = generateRoom(mapConfig);

  const mapModel = new MapModel({
    map: emptyMap,
  });

  executeRandomWalk(mapModel, {
    start: mapModel.getCenterPoint(),
    steps: 200,
  });

  return mapModel;
}
/**
 * creates a 2D array representing a room (map)
 *
 * @param {MapConfig} mapConfig
 * @returns {Map}
 */
export function generateRoom({width, height}) {
  let map = [];

  for (var x = 0; x < width; x++) {
    map.push([]);
    for (var y = 0; y < height; y++) {
      map[x][y] = 0;
    }
  }

  return map;
}
/**
 * uses the Random Walk process to apply paths to a Map
 *  https://en.wikipedia.org/wiki/Random_walk
 *
 * @param {MapModel} mapModel
 * @param {Object} options
 * @property {Point} options.start - point to start
 * @property {Number} options.steps - how many steps to walk
 */
function executeRandomWalk(mapModel, {start, steps}) {
  // set our starting point as a path
  mapModel.setTileAt(start, 1);

  randomWalkStep(mapModel, {
    currentPoint: start,
    remainingSteps: steps,
    stepSize: 2,
  })
}
/**
 * recursively updates a point on the map and takes a step
 *
 * @param {MapModel} mapModel
 * @param {Object} stepOptions
 * @property {Point} stepOptions.currentPoint - point where the step is at
 * @property {Number} stepOptions.remainingSteps - steps left to make
 * @property {Number} stepOptions.stepSize - how many tiles to create per step
 */
function randomWalkStep(mapModel, stepOptions) {
  const {
    currentPoint,
    remainingSteps,
    stepSize = 1,
  } = stepOptions;

  // pick a direction for the next step
  const nextDirectionPoint = getRandomDirection();

  // loop to handle each step covering more than one Tile
  let _currentPoint = currentPoint;
  for (var i = 0; i < stepSize; i++) {
    _currentPoint = mapModel.getAvailablePoint(_currentPoint.add(nextDirectionPoint));
    mapModel.setTileAt(_currentPoint, 1);
  }

  if (remainingSteps > 0) {
    randomWalkStep(mapModel, {
      currentPoint: _currentPoint,
      remainingSteps: remainingSteps - 1,
      stepSize: stepSize,
    })
  }
}
/**
 * creates a random tile type
 *
 * @returns {Number}
 */
function getRandomTileType() {
  return getRandomIntInclusive(2, 5);
}
/**
 * places special rooms
 *  picks a location based on the mapArray
 *
 * @param {Map} mapArray
 * @param {Number} numSpecials
 * @returns {Map}
 */
function generateSpecialTiles(mapArray, numSpecials) {
  const map = mapArray.slice();

  const height = map.length;
  const width = map[0].length;

  for (var i = 0; i < numSpecials; i ++) {
    // we want to pick a location that's not at the extremes
    const randomRow = getRandomIntInclusive(1, height - 2);
    const randomCol = getRandomIntInclusive(1, width - 2);

    // set the index of the chosen coordinates to a random tile type
    map[randomRow][randomCol] = getRandomTileType();
  }

  return map;
}
/**
 * creates a Point that indicates a direction to go
 *
 * @returns {Point}
 */
export function getRandomDirection() {
  const direction = getRandomIntInclusive(0, 3);
  switch (direction) {
    // left
    case 0:
      return new Point(-1, 0);
    // right
    case 1:
      return new Point(-1, 0);
    // up
    case 2:
      return new Point(0, -1);
    // down
    case 3:
      return new Point(0, 1);
  }
}
