import Point from '@studiomoniker/point';

import {graveyardBiomeBaseMatrix} from 'collections/biomeCollection';

import {
  TILE_TYPES,
} from 'constants.shared/tileTypes';

import MapModel from 'models.shared/MapModel';

// import * as lightLevelUtils from 'utilities.shared/lightLevelUtils';
import * as mathUtils from 'utilities.shared/mathUtils';
import * as matrixUtils from 'utilities.shared/matrixUtils';

import randomWalk from 'utilities/randomWalk';

/**
 * @param {MapModel} tileMapModel
 * @param {BiomeSettings} biomeSettings
 * @returns {MapModel}
 */
export function createHomeBiomeModel(tileMapModel, biomeSettings) {
  const {
    width,
    height,
    spawnPoint,
  } = biomeSettings;

  const centerPoint = new Point(
    Math.floor(width / 2),
    Math.floor(height / 2),
  );

  // use recursion to create path
  const baseMatrix = matrixUtils.createMatrix(width, height, null);
  randomWalk(baseMatrix, centerPoint, 200, 3);

  // make a MapModel with the same dimensions as the full map
  const fullBiomeMapModel = new MapModel({
    start: spawnPoint,
    defaultWidth: tileMapModel.getWidth(),
    defaultHeight: tileMapModel.getHeight(),
  });
  fullBiomeMapModel.mergeMatrix(baseMatrix, spawnPoint);

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
    spawnPoint,
  } = biomeSettings;

  const biomeMapModel = new MapModel({
    matrix: graveyardBiomeBaseMatrix,
    start: spawnPoint,
  });

  // make it so it is the same dimension as the full map
  const fullBiomeMapModel = new MapModel({
    defaultWidth: tileMapModel.getWidth(),
    defaultHeight: tileMapModel.getHeight(),
  });
  fullBiomeMapModel.mergeMatrixModel(biomeMapModel, biomeMapModel.get('start'));
  return fullBiomeMapModel;
}
/**
 * idea: there can be many kinds of woods of different sizes and shapes
 *
 * @param {MapModel} tileMapModel
 * @returns {MapModel}
 */
export function createSmallWoodsBiomeModel(tileMapModel) {
  const width = mathUtils.getRandomIntInclusive(5, 8);
  const height = mathUtils.getRandomIntInclusive(5, 8);
  const centerPoint = new Point(
    Math.floor(width / 2),
    Math.floor(height / 2),
  );

  // randomly generate a path - this becomes the actual walkable map
  const baseMatrix = matrixUtils.createMatrix(width, height, null);
  randomWalk(baseMatrix, centerPoint, 25, 2, TILE_TYPES.WOODS);

  const spawnPoint = tileMapModel.getRandomEmptyLocationNearWalkableTile(width, height, 2);

  // make it so it is the same dimension as the full map
  const fullBiomeMapModel = new MapModel({
    start: spawnPoint,
    defaultWidth: tileMapModel.getWidth(),
    defaultHeight: tileMapModel.getHeight(),
  });
  fullBiomeMapModel.mergeMatrix(baseMatrix, spawnPoint);

  return fullBiomeMapModel;
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
