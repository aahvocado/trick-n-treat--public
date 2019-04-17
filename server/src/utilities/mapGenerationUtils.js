import Pathfinding from 'pathfinding';
import Point from '@studiomoniker/point';

import {graveyardBiomeBaseModel} from 'collections/biomeCollection';

import {POINTS} from 'constants/points';
import {
  TILE_TYPES,
  FOG_TYPES,
  isLitTile,
} from 'constants/tileTypes';

import MapModel from 'models/MapModel';

import * as mapUtils from 'utilities/mapUtils';
import * as mathUtils from 'utilities/mathUtils';
import * as matrixUtils from 'utilities/matrixUtils';

/**
 * creates the Model for the Tile Map
 *
 * @param {Object} mapSettings
 * @returns {MapModel}
 */
export function createBaseTileMapModel(mapSettings) {
  const baseMatrix = matrixUtils.createMatrix(mapSettings.width, mapSettings.height, TILE_TYPES.EMPTY);

  // starting Tile is a House
  const startPoint = mapSettings.startPoint.clone();
  matrixUtils.setTileAt(baseMatrix, startPoint, TILE_TYPES.HOUSE);

  return new MapModel({
    matrix: baseMatrix,
    start: startPoint,
    mapSettings: mapSettings,
  });
}
/**
 * creates the Model for the Fog Matrix
 *
 * @param {MapModel} baseMapModel
 * @param {Object} mapSettings
 * @returns {MapModel}
 */
export function createFogMapModel(baseMapModel, mapSettings) {
  const startPoint = mapSettings.startPoint.clone();

  // we're going to keep track of lit tiles so we can create the gradation afterwords
  const pointsWithLight = [startPoint];

  // create a matrix with lit and hidden tiles
  const baseMatrix = baseMapModel.map((tileData, tilePoint) => {
    // if tile is defined as a lit tile, we can say it's visible
    if (isLitTile(tileData)) {
      pointsWithLight.push(tilePoint);
      return FOG_TYPES.VISIBLE;
    }

    return FOG_TYPES.HIDDEN;
  });

  // create the Model
  const newFogMapModel = new MapModel({
    start: startPoint,
    matrix: baseMatrix,
    mapSettings: mapSettings,
  });

  // starting point is Visible
  newFogMapModel.setTileAt(startPoint, FOG_TYPES.VISIBLE);

  // update slowly dimming visibility to those
  pointsWithLight.forEach((lightPoint) => {
    mapUtils.updateFogPointToVisible(newFogMapModel, baseMapModel, lightPoint);
  });

  return newFogMapModel;
}
/**
 * @param {MapModel} baseMapModel
 * @param {BiomeSettings} biomeSettings
 * @returns {MapModel}
 */
export function createHomeBiomeModel(baseMapModel, biomeSettings) {
  const {
    width,
    height,
  } = biomeSettings;

  // create an empty Map
  const fullBiomeMapModel = new MapModel({
    baseWidth: baseMapModel.getWidth(),
    baseHeight: baseMapModel.getHeight(),
  });

  // use recursion to create paths on our MapModel
  const centerPoint = new Point(
    Math.floor(width / 2),
    Math.floor(height / 2),
  );
  randomWalkStep(fullBiomeMapModel, centerPoint, 200, 3);

  return fullBiomeMapModel;
}
/**
 * recursively uses the Random Walk process to apply paths to a Map
 *  https://en.wikipedia.org/wiki/Random_walk
 *
 * @param {MapModel} mapModel
 * @param {Point} currentPoint
 * @param {Number} remainingSteps
 * @param {Number} stepSize
 * @param {TileType} [stepType]
 */
function randomWalkStep(mapModel, currentPoint, remainingSteps, stepSize, stepType = TILE_TYPES.SIDEWALK) {
  // pick a direction for the next step
  const nextDirectionPoint = getRandomWeightedDirection(mapModel.get('matrix'), currentPoint);

  // loop to handle each step covering more than one Tile
  let nextPoint = currentPoint.clone();
  for (let i = 0; i < stepSize; i++) {
    // get the next Point on the map, and check if it is a valid point on the map
    const stepPoint = nextPoint.clone().add(nextDirectionPoint);
    nextPoint = mapModel.getAvailablePoint(stepPoint);

    // only update if the tile is not defined
    const nextTileType = mapModel.getTileAt(nextPoint);
    if (nextTileType === TILE_TYPES.EMPTY || nextTileType === null) {
      mapModel.setTileAt(nextPoint, stepType);
    }
  }

  // continue recursion if there are remaining steps
  if (remainingSteps > 0) {
    randomWalkStep(mapModel, nextPoint, (remainingSteps - 1), stepSize, stepType);
  }
}
/**
 * create this Biome based on given map using given settings
 *
 * @param {MapModel} baseMapModel
 * @param {BiomeSettings} biomeSettings
 * @returns {MapModel}
 */
export function createGraveyardBiomeModel(baseMapModel, biomeSettings) {
  const {
    connectingPoints,
    spawnPoint,
  } = biomeSettings;

  // create an empty MapModel
  const fullBiomeMapModel = new MapModel({
    baseWidth: baseMapModel.getWidth(),
    baseHeight: baseMapModel.getHeight(),
  });

  // set our Biome matrix at the spawn point
  fullBiomeMapModel.mergeMatrix(graveyardBiomeBaseModel, spawnPoint);

  // use the base Map to find the Point of the nearest walkable tile
  const chosenConnectingPoint = connectingPoints[0].clone();
  const nearestPathPoint = mapUtils.getPointOfNearestWalkableType(baseMapModel.getMatrix(), chosenConnectingPoint, 25);

  // find a path that takes us from the graveyard to the nearest path
  const walkableMatrix = matrixUtils.createMatrix(fullBiomeMapModel.getWidth(), fullBiomeMapModel.getHeight(), TILE_TYPES.PATH);
  const connectingPath = mapUtils.getAStarPath(walkableMatrix, chosenConnectingPoint, nearestPathPoint);

  // connect them together on our new Biome MapModel
  fullBiomeMapModel.setTileList(connectingPath, TILE_TYPES.PATH);

  // done
  return fullBiomeMapModel;
}
/**
 * idea: there can be many kinds of woods of different sizes and shapes
 *
 * @param {MapModel} baseMapModel
 * @returns {MapModel}
 */
export function createSmallWoodsBiomeModel(baseMapModel) {
  const biomeWidth = mathUtils.getRandomIntInclusive(5, 8);
  const biomeHeight = mathUtils.getRandomIntInclusive(5, 8);
  const spawnPoint = mapUtils.getRandomEmptyLocationNearWalkableTile(baseMapModel, biomeWidth, biomeHeight, 3);
  const connectingPoint = new Point(spawnPoint.x + Math.floor(biomeWidth / 2), spawnPoint.y + Math.floor(biomeHeight / 2));

  // create the basic model
  const woodsBiomeModel = new MapModel({
    start: spawnPoint,
    baseWidth: biomeWidth,
    baseHeight: biomeHeight,
  });

  // the Woods is small and just built with stuff
  randomWalkStep(woodsBiomeModel, connectingPoint, 25, 2, TILE_TYPES.WOODS);

  // add some decor
  woodsBiomeModel.forEach((tileType, tilePoint) => {
    // don't override existing tiles
    if (tileType !== TILE_TYPES.EMPTY && tileType !== null) {
      return;
    }

    // pick a random decor
    const {result} = mathUtils.getRandomWeightedChoice([
      {
        result: TILE_TYPES.TREE_ONE,
        weight: 10,
      }, {
        result: TILE_TYPES.TREE_TWO,
        weight: 10,
      }, {
        result: TILE_TYPES.TREE_THREE,
        weight: 10,
      }, {
        result: TILE_TYPES.SPOOKY_TREE_ONE,
        weight: 1,
      }, {
        result: TILE_TYPES.LIT_WOODS,
        weight: 5,
      }, {
        result: TILE_TYPES.WOODS_TWO,
        weight: 5,
      }, {
        result: TILE_TYPES.LIT_WOODS_TWO,
        weight: 5,
      }, {
        result: null,
        weight: 75,
      },
    ]);

    woodsBiomeModel.setTileAt(tilePoint, result);
  });

  // create a MapModel using the base map's dimensions
  const fullBiomeMapModel = new MapModel({
    baseWidth: baseMapModel.getWidth(),
    baseHeight: baseMapModel.getHeight(),
  });

  // set our Biome matrix at the spawn point
  fullBiomeMapModel.mergeMatrix(woodsBiomeModel, spawnPoint);

  // create the path that takes us from this Biome to the nearest walkable Tile
  const nearestPathPoint = mapUtils.getPointOfNearestWalkableType(baseMapModel.getMatrix(), spawnPoint, 25);
  const walkableMatrix = matrixUtils.createMatrix(fullBiomeMapModel.getWidth(), fullBiomeMapModel.getHeight(), TILE_TYPES.PATH);
  const connectingPath = mapUtils.getAStarPath(walkableMatrix, connectingPoint, nearestPathPoint);
  fullBiomeMapModel.setTileList(connectingPath, TILE_TYPES.WOODS);

  // done
  return fullBiomeMapModel;
}
/**
 * creates a Point that indicates a direction to go
 *  but weighted based on how close they are to the edge
 *
 * @param {Matrix} matrix
 * @param {Point} currentPoint - current point on the matrix
 * @returns {Point}
 */
export function getRandomWeightedDirection(matrix, currentPoint) {
  // anonymous function to calculate adjust weight
  const calculateWeight = (val) => {
    return Math.pow((val * 100), 2);
  };

  // wip set up some variables
  const xMaxIdx = matrix[0].length - 1;
  const yMaxIdx = matrix.length - 1;

  const distanceFromLeft = currentPoint.x;
  const distanceFromRight = xMaxIdx - currentPoint.x;
  const distanceFromTop = currentPoint.y;
  const distanceFromBottom = yMaxIdx - currentPoint.y;

  // pick a direction based on its weight
  const chosenChoice = mathUtils.getRandomWeightedChoice([
    {
      result: POINTS.LEFT,
      weight: calculateWeight(distanceFromLeft / xMaxIdx),
    }, {
      result: POINTS.RIGHT,
      weight: calculateWeight(distanceFromRight / xMaxIdx),
    }, {
      result: POINTS.UP,
      weight: calculateWeight(distanceFromTop / yMaxIdx),
    }, {
      result: POINTS.DOWN,
      weight: calculateWeight(distanceFromBottom / yMaxIdx),
    },
  ]);

  return chosenChoice.result;
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
