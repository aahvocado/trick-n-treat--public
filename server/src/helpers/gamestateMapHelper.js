import {GAME_MODES} from 'constants/gameModes';
import {
  HOME_BIOME_SETTINGS,
  GRAVEYARD_BIOME_SETTINGS,
} from 'constants/biomeSettings';
import {MAP_SETTINGS} from 'constants/mapSettings';
// import {TILE_TYPES} from 'constants/tileTypes';

import gameState from 'data/gameState';

// import MapModel from 'models/MapModel';

import logger from 'utilities/logger';
import * as encounterGenerationUtils from 'utilities/encounterGenerationUtils';
import * as houseGenerationUtils from 'utilities/houseGenerationUtils';
// import * as mapUtils from 'utilities/mapUtils';
import * as mapGenerationUtils from 'utilities/mapGenerationUtils';
// import * as matrixUtils from 'utilities/matrixUtils';

/**
 * this Helper should try to organize the data (to be fleshed out later)
 */

// -- initializers
/**
 * generates a New Map for the current Gamestate
 *
 * @param {Object} settings
 */
export function generateNewMap(settings = MAP_SETTINGS) {
  logger.game('Generating New Map...');

  // create the map instance
  const baseTileMapModel = mapGenerationUtils.createBaseTileMapModel(settings);
  gameState.set({tileMapModel: baseTileMapModel});

  //
  const homeBiomeMapModel = mapGenerationUtils.createHomeBiomeModel(baseTileMapModel, HOME_BIOME_SETTINGS);
  baseTileMapModel.mergeMatrix(homeBiomeMapModel);

  // put biome locations onto the map
  const graveyardMapModel = mapGenerationUtils.createGraveyardBiomeModel(baseTileMapModel, GRAVEYARD_BIOME_SETTINGS);
  baseTileMapModel.mergeMatrix(graveyardMapModel);

  const woodsMapModel = mapGenerationUtils.createSmallWoodsBiomeModel(baseTileMapModel);
  baseTileMapModel.mergeMatrix(woodsMapModel);

  baseTileMapModel.mergeMatrix(mapGenerationUtils.createSmallWoodsBiomeModel(baseTileMapModel));

  baseTileMapModel.mergeMatrix(mapGenerationUtils.createSmallWoodsBiomeModel(baseTileMapModel));

  baseTileMapModel.mergeMatrix(mapGenerationUtils.createSmallWoodsBiomeModel(baseTileMapModel));

  baseTileMapModel.mergeMatrix(mapGenerationUtils.createSmallWoodsBiomeModel(baseTileMapModel));

  // place encounters and house instances
  // const houseList = createHouseList(baseTileMapModel);
  // const encounterList = createEncounterList(baseTileMapModel);

  // generate a fog model
  const fogMapModel = mapGenerationUtils.createFogMapModel(baseTileMapModel, settings);
  gameState.set({fogMapModel: fogMapModel});

  // finally, actually set the actual data onto the gamestate
  gameState.set({
    mode: GAME_MODES.ACTIVE,
    // houses: houseList,
    // encounters: encounterList,
  });

  // update initial visibility
  gameState.get('characters').forEach((characterModel) => {
    gameState.updateToVisibleAt(characterModel.get('position'), characterModel.get('vision'));
  });

  // start the first round, which will create a turn queue
  gameState.addToActionQueue(gameState.handleStartOfRound.bind(gameState));
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
 * generates the houses and sets them on the TileMap
 *
 * @param {MapModel} mapModel
 * @returns {Array<EncounterModel>}
 */
export function createHouseList(mapModel) {
  const houseList = houseGenerationUtils.generateHouseList(mapModel);
  return houseList;
}
