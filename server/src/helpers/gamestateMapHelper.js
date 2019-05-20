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
import {TAG_ID} from 'constants.shared/tagIds';

import gameState from 'data/gameState';

import logger from 'utilities/logger.game';
import * as encounterGenerationUtils from 'utilities/encounterGenerationUtils';
import * as houseGenerationUtils from 'utilities/houseGenerationUtils';
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
 */
export function generateNewMap() {
  logger.game('Generating New Map...');
  console.time('MapGenTime');

  // create the map instance
  const tileMapModel = mapGenerationUtils.createBaseTileMapModel(MAP_SETTINGS);
  gameState.set({tileMapModel: tileMapModel});

  // generate the Home neighborhood
  generateHomeBiome();

  // -- generate biomes
  generateGraveyard();

  generateSmallWoods();
  generateSmallWoods();
  generateSmallWoods();

  // place entities based on the entire map
  // handlePlacingEntities(tileMapModel);

  // generate a fog model
  generateFogMap();

  // start the first round, which will create a turn queue
  console.timeEnd('MapGenTime');
  gameState.set({mode: GAME_MODES.ACTIVE});
  gameState.addToActionQueue(gameState.handleStartOfRound.bind(gameState));
}
/**
 *
 */
export function generateFogMap() {
  logger.game('. Generating Fog Map');
  const tileMapModel = gameState.get('tileMapModel');
  const fogMapModel = mapGenerationUtils.createFogMapModel(tileMapModel, MAP_SETTINGS);
  gameState.set({fogMapModel: fogMapModel});

  // update Visibility for where Characters are located
  logger.game('. . and updating visibility for Characters');
  const characters = gameState.get('characters');
  characters.forEach((characterModel) => {
    gameState.updateToVisibleAt(characterModel.get('position'), characterModel.get('vision'));
  });

  return fogMapModel;
}
/**
 *
 */
export function generateHomeBiome() {
  logger.game('. Generating Home Biome');
  const tileMapModel = gameState.get('tileMapModel');
  const biomeMapModel = mapGenerationUtils.createHomeBiomeModel(tileMapModel, HOME_BIOME_SETTINGS);

  logger.game('. . and House Encounters');
  const houseEncounterList = houseGenerationUtils.generateHouses(biomeMapModel, HOME_BIOME_SETTINGS);
  houseEncounterList.forEach((encounterModel) => {
    gameState.addToArray('encounters', encounterModel);
    biomeMapModel.setTileAt(encounterModel.get('location'), TILE_TYPES.HOUSE);
  });

  // merge map and add it to the biome list
  tileMapModel.mergeMatrixModel(biomeMapModel);
  gameState.addToArray('biomeList', biomeMapModel);
  return biomeMapModel;
}
/**
 *
 */
export function generateGraveyard() {
  logger.game('. Generating Graveyard Biome');
  const tileMapModel = gameState.get('tileMapModel');
  const biomeMapModel = mapGenerationUtils.createGraveyardBiomeModel(tileMapModel, GRAVEYARD_BIOME_SETTINGS);

  // merge map and add it to the biome list
  tileMapModel.mergeMatrixModel(biomeMapModel, biomeMapModel.get('start'));
  gameState.addToArray('biomeList', biomeMapModel);
  return biomeMapModel;
}
/**
 *
 */
export function generateSmallWoods() {
  logger.game('. Generating Small Woods Biome');
  const tileMapModel = gameState.get('tileMapModel');
  const biomeMapModel = mapGenerationUtils.createSmallWoodsBiomeModel(tileMapModel);

  // merge map and add it to the biome list
  tileMapModel.mergeMatrixModel(biomeMapModel, biomeMapModel.get('start'));
  gameState.addToArray('biomeList', biomeMapModel);
  return biomeMapModel;
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
  const tagsToSearch = [TAG_ID.ENCOUNTER];

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
    excludeTags: [TAG_ID.DEBUG, TAG_ID.HOUSE],
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
