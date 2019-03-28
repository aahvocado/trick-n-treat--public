import POINTS from 'constants/points';
import {TILE_TYPES} from 'constants/tileTypes';

import Point from '@studiomoniker/point';

import Pathfinding from 'pathfinding';
import * as mapUtils from 'utilities/mapUtils';
import * as mathUtils from 'utilities/mathUtils';
import * as matrixUtils from 'utilities/matrixUtils';

/**
 * uses the Random Walk process to apply paths to a Map
 *  https://en.wikipedia.org/wiki/Random_walk
 *
 * @param {MapModel} mapModel
 * @param {Object} mapConfig
 */
export function executeRandomWalk(mapModel, mapConfig) {
  // use recursion to create paths on our MatrixModel
  randomWalkStep(mapModel, mapConfig.numSteps, mapModel.get('start'), mapConfig);
}
/**
 * recursively updates a point on the map and takes a step
 *
 * @param {MapModel} mapModel
 * @param {Number} remainingSteps - steps left to make
 * @param {Point} currentPoint - current point on the matrix
 * @param {Object} mapConfig
 */
function randomWalkStep(mapModel, remainingSteps, currentPoint, mapConfig) {
  const {
    stepSize = 1,
  } = mapConfig;

  // pick a direction for the next step
  const nextDirectionPoint = getRandomWeightedDirection(mapModel, currentPoint);

  // loop to handle each step covering more than one Tile
  let _currentPoint = currentPoint;
  for (let i = 0; i < stepSize; i++) {
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
    randomWalkStep(mapModel, (remainingSteps - 1), _currentPoint, mapConfig);
  }
}
/**
 * creates a Point that indicates a direction to go
 *  but weighted based on how close they are to the edge
 *
 * @param {MapModel} mapModel
 * @param {Point} currentPoint - current point on the matrix
 * @returns {Point}
 */
export function getRandomWeightedDirection(mapModel, currentPoint) {
  // anonymous function to calculate adjust weight
  const calculateWeight = (val) => {
    return Math.pow((val * 100), 2);
  };

  // wip set up some variables
  const xMaxIdx = mapModel.getWidth() - 1;
  const yMaxIdx = mapModel.getHeight() - 1;

  const distanceFromLeft = currentPoint.x;
  const distanceFromRight = xMaxIdx - currentPoint.x;
  const distanceFromTop = currentPoint.y;
  const distanceFromBottom = yMaxIdx - currentPoint.y;

  // pick a direction based on its weight
  const direction = mathUtils.getRandomWeightedChoice([
    {
      name: 'left',
      weight: calculateWeight(distanceFromLeft / xMaxIdx),
    }, {
      name: 'right',
      weight: calculateWeight(distanceFromRight / xMaxIdx),
    }, {
      name: 'up',
      weight: calculateWeight(distanceFromTop / yMaxIdx),
    }, {
      name: 'down',
      weight: calculateWeight(distanceFromBottom / yMaxIdx),
    },
  ]);

  switch (direction.name) {
    case 'left':
      return POINTS.LEFT;
    case 'right':
      return POINTS.RIGHT;
    case 'up':
      return POINTS.UP;
    case 'down':
      return POINTS.DOWN;
  }
}
/**
 * places special Tiles onto the Map
 *
 * @param {MapModel} mapModel
 * @param {Object} options
 * @property {Number} options.numSpecialTiles
 */
export function generateSpecialTiles(mapModel, options) {
  const {numSpecialTiles} = options;

  const pathsToSpecial = [];
  for (let i = 0; i < numSpecialTiles; i ++) {
    // pick a location for a special tile
    const placementPoint = getRandomSpecialTileLocation(mapModel, options);
    mapModel.attributes.specialPoints.push(placementPoint);

    // update the Tile
    mapModel.setTileAt(placementPoint, TILE_TYPES.SPECIAL);

    // find paths from the Special Tile's location to the center
    const startX = placementPoint.x;
    const startY = placementPoint.y;
    const endX = mapModel.get('start').x;
    const endY = mapModel.get('start').y;

    // create grid for the Finder, setting the specific tiles as walkable (since non-0 is typically unwalkable)
    const grid = mapUtils.createGridForPathfinding(mapModel.getMatrix());
    grid.setWalkableAt(startX, startY, true);
    grid.setWalkableAt(endX, endY, true);

    // find the shortest path to the starting location
    const finder = new Pathfinding.AStarFinder();
    const path = finder.findPath(startX, startY, endX, endY, grid);
    pathsToSpecial.push(path);
  }

  pathsToSpecial.forEach((path) => {
    // update the Map with the coordinates gotten from the path
    path.forEach((coordinate) => {
      const convertedCoordinate = new Point(coordinate[0], coordinate[1]);
      if (mapModel.getTileAt(convertedCoordinate) === TILE_TYPES.EMPTY) {
        mapModel.setTileAt(convertedCoordinate, TILE_TYPES.PATH);
      }
    });
  });
}
/**
 * we want to pick a location that's not at the extremes
 *
 * @param {MapModel} mapModel
 * @param {Object} options
 * @property {Point} options.specialMinDistance
 * @returns {Point}
 */
export function getRandomSpecialTileLocation(mapModel, options) {
  const {specialMinDistance} = options;

  // we want to pick a location that's not at the extremes
  const placementPoint = new Point(
    mathUtils.getRandomIntInclusive(1, mapModel.getWidth() - 2),
    mathUtils.getRandomIntInclusive(1, mapModel.getHeight() - 2)
  );

  // find if any existing points are too close to this one
  const specialPoints = mapModel.get('specialPoints');
  const tooClose = specialPoints.some((point) => {
    return placementPoint.getDistance(point) < specialMinDistance;
  });

  // if any points are too close, try again
  if (tooClose) {
    return getRandomSpecialTileLocation(mapModel, options);
  }

  // otherwise we found a valid location for ya
  return placementPoint;
}
/**
 * generates potential encounter tiles
 *
 * @param {MapModel} mapModel
 * @param {Object} options
 */
export function generateEncounterTiles(mapModel, options) {
  const {encounterRangeDistance} = options;

  // go through every single point on the map
  // (at some point we can do better than this)
  mapModel.forEach((tile, point) => {
    // if tile is not a path, don't do anything
    if (tile !== TILE_TYPES.PATH) {
      return;
    }

    // grab a chunk of the map to ease calculations
    const localizedSubmatrix = mapModel.getSubmatrixByDistance(point, 1);
    localizedSubmatrix[1][1] = 'center';

    // see if we are surrounded by many paths
    //  if so, lets put an encounter here
    const typeCounts = matrixUtils.getTypeCounts(localizedSubmatrix);
    if (typeCounts[TILE_TYPES.PATH] >= 3 && typeCounts[TILE_TYPES.ENCOUNTER] === undefined) {
      mapModel.setTileAt(point, TILE_TYPES.ENCOUNTER);
      return;
    }

    // if too close to another encounter, don't use this tile
    const minDistance = mathUtils.getRandomIntInclusive(encounterRangeDistance[0], encounterRangeDistance[1]);
    if (mapModel.hasNearbyTileType(point, TILE_TYPES.ENCOUNTER, minDistance)) {
      return;
    }

    // otherwise we can make this an Encounter tile
    mapModel.setTileAt(point, TILE_TYPES.ENCOUNTER);
  });
}
