import {GAME_MODES} from 'constants/gameModes';
import MAP_SETTINGS from 'constants/mapSettings';
import {FOG_TYPES} from 'constants/tileTypes';

import gameState from 'data/gameState';

import MapModel from 'models/MapModel';

import logger from 'utilities/logger';
import * as encounterGenerationUtils from 'utilities/encounterGenerationUtils';
import * as houseGenerationUtils from 'utilities/houseGenerationUtils';
import * as matrixUtils from 'utilities/matrixUtils';

/**
 * this Helper should try to organize the data (to be fleshed out later)
 */

// -- initializers
/**
 * generates a New Map for the current Gamestate
 */
export function generateNewMap() {
  logger.game('Generating Map...');

  // create the map instance
  const baseTileMapModel = createTileMapModel(MAP_SETTINGS);
  const houseList = createHouseList(baseTileMapModel);
  const encounterList = createEncounterList(baseTileMapModel);
  const fogMapModel = createFogOfWarModel(baseTileMapModel);

  gameState.set({
    mode: GAME_MODES.ACTIVE,
    tileMapModel: baseTileMapModel,
    houses: houseList,
    encounters: encounterList,
    fogMapModel: fogMapModel,
  });

  // update initial visibility
  gameState.get('characters').forEach((characterModel) => {
    gameState.updateToVisibleAt(characterModel.get('position'), characterModel.get('vision'));
  });

  // start the first round, which will create a turn queue
  gameState.addToActionQueue(gameState.handleStartOfRound.bind(gameState));
}
/**
 * generates a MapModel
 *
 * @param {Object} config
 * @returns {MapModel}
 */
export function createTileMapModel(config) {
  const mapModel = new MapModel({mapConfig: config});
  mapModel.generateMap();
  return mapModel;
}
/**
 * generates the encounters
 *
 * @param {MapModel} mapModel
 * @returns {Array<EncounterModel>}
 */
export function createEncounterList(mapModel) {
  return encounterGenerationUtils.generateEncounters(mapModel);
}
/**
 * inits fog of war model
 *
 * @param {MapModel} mapModel
 * @returns {MapModel}
 */
export function createFogOfWarModel(mapModel) {
  return new MapModel({
    start: mapModel.get('start').clone(),
    matrix: matrixUtils.createMatrix(mapModel.getWidth(), mapModel.getHeight(), FOG_TYPES.HIDDEN),
  });
}
/**
 * generates the houses and sets them on the TileMap
 *
 * @param {MapModel} mapModel
 * @returns {Array<EncounterModel>}
 */
export function createHouseList(mapModel) {
  const houseList = houseGenerationUtils.generateHouseList(mapModel);
  return houseList;
}
// -- formatting
/**
 * logs the current order of turns
 */
export function displayTurnQueue() {
  let displayList = '';

  const turnQueue = gameState.get('turnQueue');
  for (let i = 0; i < turnQueue.length; i++) {
    const characterModel = turnQueue[i];
    displayList += `\n${i + 1}. "${characterModel.get('name')}"`;
  }

  logger.game('Turn Order' + displayList);
}
/**
 * formats Gamestate into something more convenient for the Remote
 *
 * @returns {GamestateObject}
 */
export function getFormattedGamestateData() {
  const formattedMapData = getFormattedMapData();

  return {
    mapData: formattedMapData,
    mode: gameState.get('mode'),
    round: gameState.get('round'),
  };
}
/**
 * formats TileMapModel and the entities on the map into something more convenient
 *
 * @typedef {Object} TileData
 * @property {Point} TileData.position - {x, y}
 * @property {String} TileData.tileType
 * @property {Array<CharacterModel.export>} TileData.charactersHere
 * @property {HouseModel.export} TileData.houseHere
 * @property {EncounterModel.export} TileData.encounterHere
 *
 * @returns {Matrix<TileData>}
 */
export function getFormattedMapData() {
  const tileMapModel = gameState.get('tileMapModel');
  const fogMapModel = gameState.get('fogMapModel');

  const formattedMapData = tileMapModel.map((tileData, tilePoint) => {
    const charactersHere = gameState.getCharactersAt(tilePoint).map((character) => (character.export()));
    const houseHere = gameState.findHouseAt(tilePoint);
    const encounterHere = gameState.findEncounterAt(tilePoint);

    return {
      position: tilePoint,
      tileType: tileData,
      fogType: fogMapModel.getTileAt(tilePoint),
      charactersHere: charactersHere,
      houseHere: houseHere && houseHere.export(),
      encounterHere: encounterHere && encounterHere.export(),
    };
  });

  return formattedMapData;
}
