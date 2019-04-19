import {GAME_MODES} from 'constants/gameModes';
import {
  HOME_BIOME_SETTINGS,
  GRAVEYARD_BIOME_SETTINGS,
} from 'constants/biomeSettings';
import {MAP_SETTINGS} from 'constants/mapSettings';

import gameState from 'data/gameState';

import logger from 'utilities/logger';
import * as encounterGenerationUtils from 'utilities/encounterGenerationUtils';
import * as houseGenerationUtils from 'utilities/houseGenerationUtils';
// import * as mapUtils from 'utilities/mapUtils';
import * as mapGenerationUtils from 'utilities/mapGenerationUtils';

/**
 * this Helper should try to organize the data (to be fleshed out later)
 */

// -- initializers
/**
 * generates a New Map for the current Gamestate
 *
 * @param {Object} mapSettings
 */
export function generateNewMap(mapSettings = MAP_SETTINGS) {
  logger.game('Generating New Map...');

  // create the map instance
  const newTileMapModel = mapGenerationUtils.createBaseTileMapModel(mapSettings);
  gameState.set({tileMapModel: newTileMapModel});

  //
  const homeBiomeMapModel = mapGenerationUtils.createHomeBiomeModel(newTileMapModel, HOME_BIOME_SETTINGS);
  newTileMapModel.mergeMatrixModel(homeBiomeMapModel);

  // --  put biome locations onto the map
  const graveyardMapModel = mapGenerationUtils.createGraveyardBiomeModel(newTileMapModel, GRAVEYARD_BIOME_SETTINGS);
  newTileMapModel.mergeMatrixModel(graveyardMapModel);

  const woodsMapModel = mapGenerationUtils.createSmallWoodsBiomeModel(newTileMapModel);
  newTileMapModel.mergeMatrixModel(woodsMapModel);

  newTileMapModel.mergeMatrixModel(mapGenerationUtils.createSmallWoodsBiomeModel(newTileMapModel));

  newTileMapModel.mergeMatrixModel(mapGenerationUtils.createSmallWoodsBiomeModel(newTileMapModel));

  newTileMapModel.mergeMatrixModel(mapGenerationUtils.createSmallWoodsBiomeModel(newTileMapModel));

  newTileMapModel.mergeMatrixModel(mapGenerationUtils.createSmallWoodsBiomeModel(newTileMapModel));

  // -- put house locations
  houseGenerationUtils.findValidHouseLocation(newTileMapModel);

  // generate a fog model
  const fogMapModel = mapGenerationUtils.createFogMapModel(newTileMapModel, mapSettings);
  gameState.set({fogMapModel: fogMapModel});

  // finally, actually set the actual data onto the gamestate
  gameState.set({
    mode: GAME_MODES.ACTIVE,
    // houses: houseList,
    // encounters: encounterList,
  });

  // update Visibility for where Characters are located
  gameState.get('characters').forEach((characterModel) => {
    gameState.updateToVisibleAt(characterModel.get('position'), characterModel.get('vision'));
  });

  // start the first round, which will create a turn queue
  gameState.addToActionQueue(gameState.handleStartOfRound.bind(gameState));
}
