import {GAME_MODES} from 'constants.shared/gameModes';
import {
  HOME_BIOME_SETTINGS,
  GRAVEYARD_BIOME_SETTINGS,
} from 'constants/biomeSettings';
import {
  TILE_TYPES,
  isWalkableTile,
} from 'constants.shared/tileTypes';
import {MAP_WIDTH, MAP_HEIGHT} from 'constants/mapSettings';

import {DATA_TYPE} from 'constants.shared/dataTypes';
import {TAG_ID} from 'constants.shared/tagIds';

import gameState from 'state/gameState';

import logger from 'utilities/logger.game';
import * as clientEventHelper from 'helpers/clientEventHelper';
import * as encounterGenerationUtils from 'utilities/encounterGenerationUtils';
import * as houseGenerationUtils from 'utilities/houseGenerationUtils';
import * as mapGenerationUtils from 'utilities/mapGenerationUtils';

import * as mathUtils from 'utilities.shared/mathUtils';
import pickRandomWeightedChoice from 'utilities.shared/pickRandomWeightedChoice';

const rarityTagChoices = [
  {
    returns: TAG_ID.RARITY.COMMON,
    weight: 75,
  }, {
    returns: TAG_ID.RARITY.UNCOMMON,
    weight: 20,
  }, {
    returns: TAG_ID.RARITY.RARE,
    weight: 5,
  },
];

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

  const tileMapModel = gameState.get('tileMapModel');
  tileMapModel.set({mapHistory: []}); // reset mapHistory

  // generate base tileMap
  tileMapModel.generateMatrix(MAP_WIDTH, MAP_HEIGHT, TILE_TYPES.EMPTY);

  // generate the Home neighborhood
  generateHomeBiome();

  // -- generate biomes
  generateGraveyard();

  generateSmallWoods();
  generateSmallWoods();
  generateSmallWoods();
  generateSmallWoods();
  generateSmallWoods();

  // place entities based on the entire map
  handlePlacingEntities(tileMapModel);

  // generate a fog model
  generateFogMap();

  // start the first round, which will create a turn queue
  console.timeEnd('MapGenTime');
  gameState.set({mode: GAME_MODES.ACTIVE});

  // send update to tell clients that Game is in Progress
  clientEventHelper.sendLobbyUpdate();

  // handle starting start round
  gameState.addToActionQueue(gameState.handleStartOfRound.bind(gameState));
}
/**
 * @returns {MapModel}
 */
export function generateFogMap() {
  logger.game('. Generating Fog Map');
  const tileMapModel = gameState.get('tileMapModel');
  const fogMapModel = mapGenerationUtils.createFogMapModel(tileMapModel);
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
 * @returns {MapModel}
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

  // merge with main map and add it to the BiomeList
  tileMapModel.mergeMatrixModel(biomeMapModel);
  gameState.addToArray('biomeList', biomeMapModel);
  return biomeMapModel;
}
/**
 * @returns {MapModel}
 */
export function generateGraveyard() {
  logger.game('. Generating Graveyard Biome');
  const tileMapModel = gameState.get('tileMapModel');

  // create the basic Biome Map
  const biomeMapModel = mapGenerationUtils.createGraveyardBiomeModel(tileMapModel, GRAVEYARD_BIOME_SETTINGS);

  // pick a random border point as the point to start connecting from
  const borderPoints = biomeMapModel.getBorderPoints();
  const randomPointIdx = mathUtils.getRandomIntInclusive(0, borderPoints.length - 1);
  const connectingPoint = borderPoints[randomPointIdx];

  // find the nearest tile on the main map to connect to
  const nearestPoint = tileMapModel.getPointOfNearestWalkableType(connectingPoint, 20);

  // generate the path (and for now mark some points with a different tile type)
  tileMapModel.generatePath(nearestPoint, connectingPoint, TILE_TYPES.DEBUG);
  biomeMapModel.setTileAt(connectingPoint, TILE_TYPES.CONNECTOR);
  biomeMapModel.setTileAt(nearestPoint, TILE_TYPES.CONNECTOR);

  // merge with main map and add it to the BiomeList
  tileMapModel.mergeMatrixModel(biomeMapModel);
  gameState.addToArray('biomeList', biomeMapModel);
  return biomeMapModel;
}
/**
 * @returns {MapModel}
 */
export function generateSmallWoods() {
  logger.game('. Generating Small Woods Biome');
  const tileMapModel = gameState.get('tileMapModel');

  // create the basic Biome Map
  const biomeMapModel = mapGenerationUtils.createSmallWoodsBiomeModel(tileMapModel);

  // pick a random border point as the point to start connecting from
  const borderPoints = biomeMapModel.getBorderPoints();
  const randomPointIdx = mathUtils.getRandomIntInclusive(0, borderPoints.length - 1);
  const connectingPoint = borderPoints[randomPointIdx];

  // find the nearest tile on the main map to connect to
  const nearestPoint = tileMapModel.getPointOfNearestWalkableType(connectingPoint, 10);

  // generate the path (and for now mark some points with a different tile type)
  tileMapModel.generatePath(nearestPoint, connectingPoint, TILE_TYPES.DEBUG);
  biomeMapModel.setTileAt(connectingPoint, TILE_TYPES.CONNECTOR);
  biomeMapModel.setTileAt(nearestPoint, TILE_TYPES.CONNECTOR);

  // merge with main map and add it to the BiomeList
  tileMapModel.mergeMatrixModel(biomeMapModel);
  gameState.addToArray('biomeList', biomeMapModel);
  return biomeMapModel;
}
/**
 * determines what to generate for each tile
 *
 * @param {MapModel} mapModel
 */
export function handlePlacingEntities(mapModel) {
  logger.game('. Generating Entities and Encounters');
  mapModel.forEach((tileType, tilePoint) => {
    const walkableTile = isWalkableTile(tileType);

    // add decor to unwalkable tiles
    const noDecorChance = 80;
    const preferNoDecor = mathUtils.getRandomIntInclusive(0, 100) <= noDecorChance;
    if (!preferNoDecor && !walkableTile) {
      placeDecor(mapModel, tilePoint);
      return;
    }

    // if there are no nearby Encounters, then we should definitely make an encounter
    if (!gameState.hasNearbyEncountersOnPath(tilePoint, 2) && walkableTile) {
      placeEncounter(mapModel, tilePoint);
      return;
    }

    // otherwise make a random check with a potential to not
    const noEncountersChance = 80;
    const preferNoEncounters = mathUtils.getRandomIntInclusive(0, 100) <= noEncountersChance;
    if (!preferNoEncounters && walkableTile) {
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
    tagsToSearch.push(TAG_ID.TILE_TYPE.PATH);
  }
  if (tileOnMap === TILE_TYPES.GRASS) {
    tagsToSearch.push(TAG_ID.TILE_TYPE.GRASS);
  }
  if (tileOnMap === TILE_TYPES.SIDEWALK) {
    tagsToSearch.push(TAG_ID.TILE_TYPE.SIDEWALK);
  }
  if (tileOnMap === TILE_TYPES.ROAD) {
    tagsToSearch.push(TAG_ID.TILE_TYPE.ROAD);
  }
  if (tileOnMap === TILE_TYPES.SWAMP) {
    tagsToSearch.push(TAG_ID.TILE_TYPE.SWAMP);
  }
  if (tileOnMap === TILE_TYPES.PLANKS) {
    tagsToSearch.push(TAG_ID.PLANKS);
  }
  if (tileOnMap === TILE_TYPES.WOODS) {
    tagsToSearch.push(TAG_ID.TILE_TYPE.WOODS);
  }

  const encounterModel = encounterGenerationUtils.generateRandomEncounter({
    location: location,
    dataType: DATA_TYPE.ENCOUNTER,
    isGeneratable: true,
    rarityId: pickRandomWeightedChoice(rarityTagChoices),
    includeTags: tagsToSearch,
  });

  // there are no matches if we get `null`
  if (encounterModel === null) {
    return;
  }

  gameState.addToArray('encounters', encounterModel);
}
// -- utility
/**
 * @param {Point} point
 * @returns {Boolean}
 */
export function isWalkableAt(point) {
  const tileMapModel = gameState.get('tileMapModel');
  const foundTile = tileMapModel.getTileAt(point);
  return isWalkableTile(foundTile);
}
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
