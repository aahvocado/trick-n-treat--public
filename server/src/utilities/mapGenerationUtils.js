import Point from '@studiomoniker/point';

import {graveyardBiomeBaseMatrix} from 'collections/biomeCollection';

import {TILE_TYPES} from 'constants.shared/tileTypes';

import MapModel from 'models.shared/MapModel';

// import * as lightLevelUtils from 'utilities.shared/lightLevelUtils';
import * as mathUtils from 'utilities.shared/mathUtils';
import * as matrixUtils from 'utilities.shared/matrixUtils';

import randomWalk from 'utilities.shared/randomWalk';

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
 * @param {MapModel} tileMapModel
 * @param {BiomeSettings} biomeSettings
 * @returns {MapModel}
 */
export function createFancyBiomeModel(tileMapModel, biomeSettings) {
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
