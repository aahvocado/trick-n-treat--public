import {
  HOME_BIOME_SETTINGS,
  GRAVEYARD_BIOME_SETTINGS,
} from 'constants/biomeSettings';
import {MAP_WIDTH, MAP_HEIGHT} from 'constants/mapSettings';

import {DATA_TYPE} from 'constants.shared/dataTypes';
import {TAG_ID} from 'constants.shared/tagIds';
import {TILE_TYPES} from 'constants.shared/tileTypes';

import gameState from 'state/gameState';
import serverState from 'state/serverState';

import logger from 'utilities/logger.game';
import * as mapGenerationUtils from 'utilities/mapGenerationUtils';

import * as mathUtils from 'utilities.shared/mathUtils';
import pickRandomWeightedChoice from 'utilities.shared/pickRandomWeightedChoice';
import * as tileTypeUtils from 'utilities.shared/tileTypeUtils';

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
 * Helper based
 */

/**
 * generates a New Map for the current Gamestate
 *
 */
export function generateNewMap() {
  console.time('MapGenTime');
  logger.game('Generating New Map...');

  const tileMapModel = gameState.get('tileMapModel');
  tileMapModel.set({mapHistory: []}); // reset mapHistory

  // generate base tileMap
  tileMapModel.resetMatrix(MAP_WIDTH, MAP_HEIGHT, TILE_TYPES.EMPTY);

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

  console.timeEnd('MapGenTime');

  // send map history
  const remoteClients = serverState.get('remoteClients');
  remoteClients.forEach((client) => client.emitToMapHistory(tileMapModel.get('mapHistory')));
}
/**
 * creates the `lightSourceList` based on
 * - lit tiles
 * - lit entities (todo)
 *
 * @returns {Array<Point>}
 */
export function generateLightSourceList() {
  const tileMapModel = gameState.get('tileMapModel');

  // create a new list of light sources
  const lightSourceList = [];

  // simply look through the map and find tiles defined as lit
  tileMapModel.forEach((tileData, tilePoint) => {
    // if tile is defined as a lit tile, we can say it's visible
    if (tileTypeUtils.isLitTile(tileData)) {
      lightSourceList.push(tilePoint);
    }
  });

  // set it, returns the observable list
  gameState.set({lightSourceList: lightSourceList});
  return gameState.get('lightSourceList');
}
/**
 * @returns {MapModel}
 */
export function generateHomeBiome() {
  logger.game('. Generating Home Biome');
  const tileMapModel = gameState.get('tileMapModel');
  const biomeMapModel = mapGenerationUtils.createHomeBiomeModel(tileMapModel, HOME_BIOME_SETTINGS);

  const {
    numHouses,
  } = HOME_BIOME_SETTINGS;
  logger.game('. . and House Encounters');

  const validLocations = biomeMapModel.getPointsAdjacentToWalkableTile(1, 1, 1);
  for (let i=0; i<numHouses; i++) {
    const randomLocationIdx = mathUtils.getRandomIntInclusive(0, validLocations.length - 1);
    const houseLocation = validLocations.splice(randomLocationIdx, 1)[0];
    biomeMapModel.setTileAt(houseLocation, TILE_TYPES.HOUSE);

    placeHouse(biomeMapModel, houseLocation);
  }

  // merge with main map and add it to the BiomeList
  tileMapModel.mergeMatrixModel(biomeMapModel);
  gameState.get('biomeList').push(biomeMapModel);
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
  gameState.get('biomeList').push(biomeMapModel);
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
  gameState.get('biomeList').push(biomeMapModel);
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
    const walkableTile = tileTypeUtils.isWalkableTile(tileType);

    // add decor to unwalkable tiles
    const noDecorChance = 80;
    const preferNoDecor = mathUtils.getRandomIntInclusive(0, 100) <= noDecorChance;
    if (!preferNoDecor && !walkableTile) {
      placeDecor(mapModel, tilePoint);
      return;
    }

    // if there are no nearby Encounters, then we should definitely make an encounter
    if (!gameState.isNearEncounterAt(tilePoint, 2) && walkableTile) {
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

  // wip - use the tileType as a tag for searching
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

  // find an encounter and model using this criteria
  const encounterModel = gameState.generateRandomEncounter({
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

  // add it
  gameState.get('encounterList').push(encounterModel);
}
/**
 * picks an Encounter that is meant for houses
 *
 * @param {MapModel} mapModel
 * @param {Point} location
 */
export function placeHouse(mapModel, location) {
  const encounterModel = gameState.generateRandomEncounter({
    location: location,
    dataType: DATA_TYPE.HOUSE,
    isGeneratable: true,
    rarityId: pickRandomWeightedChoice(rarityTagChoices),
  });

  // there are no matches if we get `null`
  if (encounterModel === null) {
    return;
  }

  // add it
  gameState.get('encounterList').push(encounterModel);
}
