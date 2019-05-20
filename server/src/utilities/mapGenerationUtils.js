import Point from '@studiomoniker/point';

import {graveyardBiomeBaseMatrix} from 'collections/biomeCollection';

import {
  TILE_TYPES,
  FOG_TYPES,
  isLitTile,
} from 'constants.shared/tileTypes';

import MapModel from 'models.shared/MapModel';

import pickRandomWeightedChoice from 'utilities.shared/pickRandomWeightedChoice';
import randomizeArray from 'utilities.shared/randomizeArray';
import * as fogUtils from 'utilities.shared/fogUtils';
import * as mapUtils from 'utilities.shared/mapUtils';
import * as mathUtils from 'utilities.shared/mathUtils';
import * as matrixUtils from 'utilities.shared/matrixUtils';

import randomWalk from 'utilities/randomWalk';

/**
 * creates the Model for the Tile Map
 *
 * @param {Object} mapSettings
 * @returns {MapModel}
 */
export function createBaseTileMapModel(mapSettings) {
  const {
    startPoint,
    width,
    height,
  } = mapSettings;

  const newMapModel = new MapModel({
    mapSettings: mapSettings,
    start: startPoint.clone(),
    baseWidth: width,
    baseHeight: height,
  });

  newMapModel.generateMatrix(width, height, TILE_TYPES.EMPTY);

  newMapModel.setTileAt(startPoint, TILE_TYPES.HOUSE);

  return newMapModel;
}
/**
 * creates the Model for the Fog Matrix
 *
 * @param {MapModel} tileMapModel
 * @param {Object} mapSettings
 * @returns {MapModel}
 */
export function createFogMapModel(tileMapModel, mapSettings) {
  const startPoint = mapSettings.startPoint.clone();

  // we're going to keep track of lit tiles so we can create the gradation afterwords
  const pointsWithLight = [startPoint];

  // create a matrix with lit and hidden tiles
  const baseMatrix = tileMapModel.map((tileData, tilePoint) => {
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
    fogUtils.updateFogPointToVisible(newFogMapModel, tileMapModel, lightPoint);
  });

  return newFogMapModel;
}
/**
 * @param {MapModel} tileMapModel
 * @param {BiomeSettings} biomeSettings
 * @returns {MapModel}
 */
export function createHomeBiomeModel(tileMapModel, biomeSettings) {
  const {
    width,
    height,
  } = biomeSettings;

  // create an empty Map
  const fullBiomeMapModel = new MapModel({
    baseWidth: tileMapModel.getWidth(),
    baseHeight: tileMapModel.getHeight(),
  });

  // use recursion to create paths on our MapModel
  const centerPoint = new Point(
    Math.floor(width / 2),
    Math.floor(height / 2),
  );
  randomWalk(fullBiomeMapModel.get('matrix'), centerPoint, 200, 3);

  return fullBiomeMapModel;
}
/**
 * create this Biome based on given map using given settings
 *
 * @param {MapModel} tileMapModel
 * @param {BiomeSettings} biomeSettings
 * @returns {MapModel}
 */
export function createGraveyardBiomeModel(tileMapModel, biomeSettings) {
  const {
    connectingPoints,
    spawnPoint,
  } = biomeSettings;

  const biomeMapModel = new MapModel({
    matrix: graveyardBiomeBaseMatrix,
    start: spawnPoint,
    connectingPointList: connectingPoints,
  });

  return biomeMapModel;
}
/**
 * idea: there can be many kinds of woods of different sizes and shapes
 *
 * @param {MapModel} tileMapModel
 * @returns {MapModel}
 */
export function createSmallWoodsBiomeModel(tileMapModel) {
  const biomeWidth = mathUtils.getRandomIntInclusive(5, 8);
  const biomeHeight = mathUtils.getRandomIntInclusive(5, 8);
  const spawnPoint = tileMapModel.getRandomEmptyLocationNearWalkableTile(biomeWidth, biomeHeight, 2);

  // create the basic model
  const woodsBiomeModel = new MapModel({
    start: spawnPoint,
    baseWidth: biomeWidth,
    baseHeight: biomeHeight,
  });

  // generate things from the center of the model
  const connectingPoint = new Point(
    spawnPoint.x + Math.floor(biomeWidth / 2),
    spawnPoint.y + Math.floor(biomeHeight / 2),
  );

  // randomly generate a path - this becomes the actual walkable map
  const mapMatrix = woodsBiomeModel.get('matrix');
  randomWalk(mapMatrix, connectingPoint, 25, 2, TILE_TYPES.WOODS);

  // pick a couple border points to be connecting points
  const borderPointsList = randomizeArray(woodsBiomeModel.getBorderPoints());
  woodsBiomeModel.set({connectingPointList: borderPointsList.slice(0, 2)});

  // add some decor
  woodsBiomeModel.forEach((tileType, tilePoint) => {
    // don't override existing tiles
    if (tileType !== TILE_TYPES.EMPTY && tileType !== null) {
      return;
    }

    // pick a random decor
    const decorTileType = pickRandomWeightedChoice([
      {
        returns: TILE_TYPES.TREE_ONE,
        weight: 10,
      }, {
        returns: TILE_TYPES.TREE_TWO,
        weight: 10,
      }, {
        returns: TILE_TYPES.TREE_THREE,
        weight: 10,
      }, {
        returns: TILE_TYPES.SPOOKY_TREE_ONE,
        weight: 1,
      }, {
        returns: TILE_TYPES.LIT_WOODS,
        weight: 3,
      }, {
        returns: TILE_TYPES.WOODS_TWO,
        weight: 5,
      }, {
        returns: TILE_TYPES.LIT_WOODS_TWO,
        weight: 3,
      }, {
        returns: null,
        weight: 75,
      },
    ]);

    woodsBiomeModel.setTileAt(tilePoint, decorTileType);
  });

  // done
  return woodsBiomeModel;
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
