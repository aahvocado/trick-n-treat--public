import Point from '@studiomoniker/point';
import Pathfinding from 'pathfinding';
import MapModel from 'models/MapModel';

import TILE_TYPES from 'constants/tileTypes';

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
 * @property {Array} MapConfig.startCoordinates - [x, y] - where the starting point is
 */

/**
 * handles through the entire generation process
 *
 * @param {MapConfig} mapConfig
 * @returns {MapModel}
 */
export function generateNewMapModel(mapConfig) {
  const {
    width,
    height,
    numSpecials,
    startCoordinates,
  } = mapConfig;

  const emptyMap = generateRoom(width, height);

  // initiate the Model
  const startPoint = new Point(startCoordinates[0], startCoordinates[1]);
  const mapModel = new MapModel({
    map: emptyMap,
    start: startPoint,
  });

  // set our starting point Tile
  mapModel.setTileAt(startPoint, '*');

  // create special tiles on the Map
  generateSpecialTiles(mapModel, {
    count: numSpecials,
  })

  // create paths on the Map
  executeRandomWalk(mapModel, {
    start: startPoint,
    steps: 100,
  });

  return mapModel;
}
/**
 * creates a 2D array of empty tiles
 *
 * @param {Number} width
 * @param {Number} height
 * @returns {Map}
 */
export function generateRoom(width, height) {
  let map = [];

  for (var x = 0; x < width; x++) {
    map.push([]);
    for (var y = 0; y < height; y++) {
      map[x][y] = TILE_TYPES.EMPTY;
    }
  }

  return map;
}
/**
 * uses the Random Walk process to apply paths to a Map
 *  https://en.wikipedia.org/wiki/Random_walk
 *
 * @param {MapModel} mapModel
 * @param {Object} config
 * @property {Point} config.start - point to start
 * @property {Number} config.steps - how many steps to walk
 */
function executeRandomWalk(mapModel, {start, steps}) {
  // use recursion to create paths on our MapModel
  randomWalkStep(mapModel, steps, {
    currentPoint: start,
    stepSize: 2,
  })
}
/**
 * recursively updates a point on the map and takes a step
 *
 * @param {MapModel} mapModel
 * @param {Number} remainingSteps - steps left to make
 * @param {Object} stepOptions
 * @property {Point} stepOptions.currentPoint - point where the step is at
 * @property {Number} stepOptions.stepSize - how many tiles to create per step
 */
function randomWalkStep(mapModel, remainingSteps, stepOptions) {
  const {
    currentPoint,
    stepSize = 1,
  } = stepOptions;

  // pick a direction for the next step
  const nextDirectionPoint = getRandomDirection();

  // loop to handle each step covering more than one Tile
  let _currentPoint = currentPoint;
  for (var i = 0; i < stepSize; i++) {
    // get the next Point on the map, and check if it is a valid point on the map
    const nextPoint = _currentPoint.add(nextDirectionPoint);
    _currentPoint = mapModel.getAvailablePoint(nextPoint);

    // only update if the tile is empty
    if (mapModel.getTileAt(_currentPoint) === TILE_TYPES.EMPTY) {
      mapModel.setTileAt(_currentPoint, TILE_TYPES.PATH);
    }
  }

  // continue recursion if there are remaining steps
  if (remainingSteps > 0) {
    randomWalkStep(mapModel, (remainingSteps - 1), {
      currentPoint: _currentPoint,
      stepSize: stepSize,
    })
  }
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
/**
 * places special Tiles onto the Map
 *
 * @param {MapModel} mapModel
 * @param {Object} specialOptions
 * @property {Point} specialOptions.count - number of special Tiles to generate
 */
function generateSpecialTiles(mapModel, specialOptions) {
  const { count } = specialOptions;
  for (var i = 0; i < count; i ++) {
    // we want to pick a location that's not at the extremes
    const placementPoint = new Point(
      getRandomIntInclusive(1, mapModel.getHeight() - 2),
      getRandomIntInclusive(1, mapModel.getWidth() - 2)
    )

    // note that the chosen path is special
    mapModel.setTileAt(placementPoint, TILE_TYPES.SPECIAL + i);

    // find paths from the Special Tile's location to the center
    const startX = placementPoint.x;
    const startY = placementPoint.y;
    const endX = mapModel.get('start').x;
    const endY = mapModel.get('start').y;

    // create grid for the Finder, setting the specific tiles as walkable (since non-0 is typically unwalkable)
    const grid = new Pathfinding.Grid(mapModel.get('map'));
    grid.setWalkableAt(startX, startY, true);
    grid.setWalkableAt(endX, endY, true);

    const finder = new Pathfinding.AStarFinder();
    const path = finder.findPath(startX, startY, endX, endY, grid);

    // update the Map with the coordinates gotten from the path
    path.forEach((coordinate) => {
      const convertedCoordinate = new Point(coordinate[0], coordinate[1]);
      if (mapModel.getTileAt(convertedCoordinate) === TILE_TYPES.EMPTY) {
        mapModel.setTileAt(convertedCoordinate, TILE_TYPES.PATH);
      }
    })
  }
}
