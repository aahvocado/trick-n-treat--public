import {GAME_MODES} from 'constants.shared/gameModes';
import {
  HOME_BIOME_SETTINGS,
  GRAVEYARD_BIOME_SETTINGS,
} from 'constants/biomeSettings';
import {
  TILE_TYPES,
  isWalkableTile,
} from 'constants.shared/tileTypes';
import {MAP_SETTINGS} from 'constants/mapSettings';

import gameState from 'data/gameState';

import logger from 'utilities/logger.game';
import * as encounterGenerationUtils from 'utilities/encounterGenerationUtils';
import * as houseGenerationUtils from 'utilities/houseGenerationUtils';
// import * as mapUtils from 'utilities.shared/mapUtils';
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

  // -- home neighborhood biome
  const homeBiomeMapModel = mapGenerationUtils.createHomeBiomeModel(newTileMapModel, HOME_BIOME_SETTINGS);
  // const houseList = houseGenerationUtils.generateHouses(homeBiomeMapModel, HOME_BIOME_SETTINGS);

  generateBasicEntities(homeBiomeMapModel);

  // -- place houses
  // houseList.forEach((houseModel) => {
  //   newTileMapModel.setTileAt(houseModel.get('position'), TILE_TYPES.HOUSE);
  // });

  newTileMapModel.mergeMatrixModel(homeBiomeMapModel);

  // // --  put biome locations onto the map
  // const graveyardMapModel = mapGenerationUtils.createGraveyardBiomeModel(newTileMapModel, GRAVEYARD_BIOME_SETTINGS);
  // newTileMapModel.mergeMatrixModel(graveyardMapModel);

  // const woodsMapModel = mapGenerationUtils.createSmallWoodsBiomeModel(newTileMapModel);
  // newTileMapModel.mergeMatrixModel(woodsMapModel);

  // newTileMapModel.mergeMatrixModel(mapGenerationUtils.createSmallWoodsBiomeModel(newTileMapModel));

  // newTileMapModel.mergeMatrixModel(mapGenerationUtils.createSmallWoodsBiomeModel(newTileMapModel));

  // newTileMapModel.mergeMatrixModel(mapGenerationUtils.createSmallWoodsBiomeModel(newTileMapModel));

  // newTileMapModel.mergeMatrixModel(mapGenerationUtils.createSmallWoodsBiomeModel(newTileMapModel));

  // generate a fog model
  const fogMapModel = mapGenerationUtils.createFogMapModel(newTileMapModel, mapSettings);
  gameState.set({fogMapModel: fogMapModel});

  // finally, actually set the actual data onto the gamestate
  gameState.set({
    mode: GAME_MODES.ACTIVE,
    // houses: houseList,
  });

  // update Visibility for where Characters are located
  gameState.get('characters').forEach((characterModel) => {
    gameState.updateToVisibleAt(characterModel.get('position'), characterModel.get('vision'));
  });

  // start the first round, which will create a turn queue
  gameState.addToActionQueue(gameState.handleStartOfRound.bind(gameState));
}
/**
 * determines what to generate on a specific tile
 *
 * @param {MapModel} mapModel
 */
export function generateBasicEntities(mapModel) {
  const entities = [];
  const encounterList = [];

  mapModel.forEach((tileType, tilePoint) => {
    // only want to add stuff to walkable tiles
    if (!isWalkableTile(tileType)) {
      return;
    }

    //
    const encounterModel = encounterGenerationUtils.pickSidewalkEncounter(mapModel, tilePoint);
    if (encounterModel === null) {
      return;
    }

    encounterList.push(encounterModel);
  });

  gameState.set({
    encounters: encounterList,
  });
}

