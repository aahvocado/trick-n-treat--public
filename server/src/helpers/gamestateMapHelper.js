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
import {TAG_ID} from 'constants.shared/tagConstants';

import gameState from 'data/gameState';

import logger from 'utilities/logger.game';
import * as encounterGenerationUtils from 'utilities/encounterGenerationUtils';
// import * as houseGenerationUtils from 'utilities/houseGenerationUtils';
// import * as mapUtils from 'utilities.shared/mapUtils';
import * as mapGenerationUtils from 'utilities/mapGenerationUtils';
import * as mathUtils from 'utilities.shared/mathUtils';

/**
 * this Helper should try to organize the data (to be fleshed out later)
 */

// -- map generation
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

  // -- place houses
  // houseList.forEach((houseModel) => {
  //   newTileMapModel.setTileAt(houseModel.get('position'), TILE_TYPES.HOUSE);
  // });

  newTileMapModel.mergeMatrixModel(homeBiomeMapModel);

  // // --  put biome locations onto the map
  const graveyardMapModel = mapGenerationUtils.createGraveyardBiomeModel(newTileMapModel, GRAVEYARD_BIOME_SETTINGS);
  newTileMapModel.mergeMatrixModel(graveyardMapModel);

  const woodsMapModel = mapGenerationUtils.createSmallWoodsBiomeModel(newTileMapModel);
  newTileMapModel.mergeMatrixModel(woodsMapModel);

  newTileMapModel.mergeMatrixModel(mapGenerationUtils.createSmallWoodsBiomeModel(newTileMapModel));

  newTileMapModel.mergeMatrixModel(mapGenerationUtils.createSmallWoodsBiomeModel(newTileMapModel));

  newTileMapModel.mergeMatrixModel(mapGenerationUtils.createSmallWoodsBiomeModel(newTileMapModel));

  newTileMapModel.mergeMatrixModel(mapGenerationUtils.createSmallWoodsBiomeModel(newTileMapModel));

  // place entities based on the entire map
  handlePlacingEntities(newTileMapModel);

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
 * determines what to generate for each tile
 *
 * @param {MapModel} mapModel
 */
export function handlePlacingEntities(mapModel) {
  mapModel.forEach((tileType, tilePoint) => {
    // add decor to unwalkable tiles
    const noDecorChance = 80;
    const preferNoDecor = mathUtils.getRandomIntInclusive(0, 100) <= noDecorChance;
    if (!isWalkableTile(tileType) && !preferNoDecor) {
      placeDecor(mapModel, tilePoint);
      return;
    }

    // if there are no nearby Encounters, then we should definitely make an encounter
    const hasNearbyEncounters = hasNearbyEncountersOnPath(tilePoint, 2);
    if (!hasNearbyEncounters) {
      placeEncounter(mapModel, tilePoint);
      return;
    }

    // otherwise make a random check with a potential to not
    const noEncountersChance = 80;
    const preferNoEncounters = mathUtils.getRandomIntInclusive(0, 100) <= noEncountersChance;
    if (!preferNoEncounters) {
      placeEncounter(mapModel, tilePoint);
      return;
    }
  });
}
/**
 * determines what decor to generate on the tile
 *
 * @param {MapModel} mapModel
 * @param {Point} location
 */
export function placeDecor(mapModel, location) {
  // just use a bush for now
  mapModel.setTileAt(location, TILE_TYPES.BUSH);
}
/**
 * determines what decor to generate on the tile
 *
 * @param {MapModel} mapModel
 * @param {Point} location
 */
export function placeEncounter(mapModel, location) {
  const tagsToSearch = [];

  const tileOnMap = mapModel.getTileAt(location);
  if (tileOnMap === TILE_TYPES.PATH) {
    tagsToSearch.push(TAG_ID.PATH);
  }
  if (tileOnMap === TILE_TYPES.GRASS) {
    tagsToSearch.push(TAG_ID.GRASS);
  }
  if (tileOnMap === TILE_TYPES.SIDEWALK) {
    tagsToSearch.push(TAG_ID.SIDEWALK);
  }
  if (tileOnMap === TILE_TYPES.ROAD) {
    tagsToSearch.push(TAG_ID.ROAD);
  }
  if (tileOnMap === TILE_TYPES.SWAMP) {
    tagsToSearch.push(TAG_ID.SWAMP);
  }
  if (tileOnMap === TILE_TYPES.PLANKS) {
    tagsToSearch.push(TAG_ID.PLANKS);
  }
  if (tileOnMap === TILE_TYPES.WOODS) {
    tagsToSearch.push(TAG_ID.WOODS);
  }

  const encounterModel = encounterGenerationUtils.generateRandomEncounter({
    location: location,
    includeTags: tagsToSearch,
    excludeTags: [TAG_ID.DEBUG],
  });

  // there are no matches if we get `null`
  if (encounterModel === null) {
    return;
  }

  gameState.addToArray('encounters', encounterModel);
}
// -- utility
/**
 * determines if there is are any Encounter nearby given points
 *
 * @param {Point} startPoint
 * @param {Number} distance
 * @returns {Boolean}
 */
export function hasNearbyEncountersOnPath(startPoint, distance) {
  const encounters = gameState.get('encounters');
  const tileMapModel = gameState.get('tileMapModel');

  return encounters.some((encounterModel) => {
    const encounterLocation = encounterModel.get('location');
    return tileMapModel.isWithinPathDistance(startPoint, encounterLocation, distance);
  });
}
