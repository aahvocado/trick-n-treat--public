import {
  HOME_BIOME_SETTINGS,
  // GRAVEYARD_BIOME_SETTINGS,
  // FANCY_BIOME_SETTINGS,
} from 'constants/biomeSettings';
import {MAP_WIDTH, MAP_HEIGHT, MAP_START} from 'constants/mapSettings';

import {DATA_TYPE} from 'constants.shared/dataTypes';
import {TAG_ID} from 'constants.shared/tagIds';
import {TILE_ID} from 'constants.shared/tileIds';

import CellModel from 'models.shared/CellModel';

import gameState from 'state/gameState';

import logger from 'utilities/logger.game';

import pickRandomWeightedChoice from 'utilities.shared/pickRandomWeightedChoice';
import * as mathUtils from 'utilities.shared/mathUtils';
import * as mapGenerationUtils from 'utilities.shared/mapGenerationUtils';
import * as mazeUtils from 'utilities.shared/mazeUtils';
import * as pointUtils from 'utilities.shared/pointUtils';
import * as tileUtils from 'utilities.shared/tileUtils';

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
 * generate stuff
 */

/**
 * generates a New Map for the current Gamestate
 *
 */
export function generateNewMap() {
  logger.game('+ Creating Map');
  console.time('MapGenTime');

  const mapGridModel = gameState.get('mapGridModel');
  mapGridModel.set({history: []});
  mapGridModel.reset(MAP_WIDTH, MAP_HEIGHT, TILE_ID.EMPTY_WALL);

  gameState.insertIntoFunctionQueue(() => {
    logger.game('+ Generating Home Region');
    generateHomeGrid(mapGridModel, {
      width: HOME_BIOME_SETTINGS.width,
      height: HOME_BIOME_SETTINGS.height,
      location: HOME_BIOME_SETTINGS.location,
      tileToUse: TILE_ID.HOME.SIDEWALK,
    });

    logger.game('+ Updating Starting Tile');
    mapGridModel.setTileAt(MAP_START, TILE_ID.HOME.HIDEOUT);

    const homeEncounter = gameState.findEncounterById('ENCOUNTER_ID.HIDEOUT_HOUSE', {location: MAP_START});
    gameState.get('encounterList').push(homeEncounter);
  }, 'generate home region', 0);

  gameState.insertIntoFunctionQueue(() => {
    logger.game('+ Generating Park Regions');
    const regionIterations = 8;
    for (let iteration = 0; iteration < regionIterations; iteration++) {
      const randomWidth = mathUtils.getRandomOdd(3, 7);
      const randomHeight = mathUtils.getRandomOdd(3, 7);

      // pick a coordinate to place this region
      const randomLocation = mapGridModel.findFitPoint(randomWidth + 2, randomHeight + 2, (cell) => {
        return cell !== undefined && tileUtils.isWallTile(cell.get('tile'));
      });

      if (randomLocation === undefined) {
        break;
      }

      generateParkGrid(mapGridModel, {
        width: randomWidth,
        height: randomHeight,
        location: pointUtils.makePointEven(randomLocation),
        tileToUse: TILE_ID.PARK.GRASS,
      });
    }
  }, 'generate park regions', 1);

  gameState.insertIntoFunctionQueue(() => {
    logger.game('+ Generating Paths');
    mazeUtils.generateMazeEverywhere(mapGridModel, {
      tileToUse: TILE_ID.HOME.ROAD,
    });
  }, 'generate paths', 2);

  gameState.insertIntoFunctionQueue(() => {
    logger.game('+ Connecting Regions');
    mapGenerationUtils.connectRegions(mapGridModel, {
      tileToUse: TILE_ID.HOME.ROAD,
    });
  }, 'connect regions', 3);

  gameState.insertIntoFunctionQueue(() => {
    logger.game('+ Removing Dead Ends');
    mazeUtils.removeDeadEnds(mapGridModel);
  }, 'remove dead ends', 4);

  // after map is generated, update the world the first time
  gameState.insertIntoFunctionQueue(() => {
    gameState.updateEncounters();
    gameState.updateLighting();
  }, 'updateWorld', 5);

  // done
  gameState.insertIntoFunctionQueue(() => {
    console.timeEnd('MapGenTime');
    mapGridModel.snapshot();
  }, 'finish generation', 6);
}
/**
 * generates a New Map for the current Gamestate
 *
 * @param {GridModel} mapGridModel
 * @param {Object} options
 */
export function generateHomeGrid(mapGridModel, options = {}) {
  const {
    width,
    height,
    location,
    tileToUse,
  } = options;

  // random walk all over
  const newGridModel = mapGenerationUtils.generateRandomWalkGrid({
    width: width - 2,
    height: height - 2,
    defaultTile: tileToUse,
  });

  logger.game('. + Generating Houses');
  generateHouses(newGridModel, {
    validTiles: [tileToUse],
  });

  // always want a walkable border
  newGridModel.padding(1, new CellModel({tile: TILE_ID.HOME.ROAD}));

  // combine history with the main map's
  mapGridModel.get('history').push(...newGridModel.get('history'));

  // paste it onto the main map
  mapGridModel.paste(newGridModel, location);
  mapGridModel.snapshot();
}
/**
 * generates a New Map for the current Gamestate
 *
 * @param {GridModel} mapGridModel
 * @param {Object} options
 */
export function generateParkGrid(mapGridModel, options = {}) {
  const {
    width,
    height,
    location,
    tileToUse,
  } = options;

  // random walk all over
  const newGridModel = mapGenerationUtils.generateRandomWalkGrid({
    width: width - 2,
    height: height - 2,
    defaultTile: tileToUse,
  });

  // always want a walkable border
  newGridModel.padding(1, new CellModel({tile: TILE_ID.PARK.GRASS}));

  // combine history with the main map's
  mapGridModel.get('history').push(...newGridModel.get('history'));

  // paste it onto the main map
  mapGridModel.paste(newGridModel, location);
  mapGridModel.snapshot();
}
/**
 * determines what to put as a house for a gridModel
 *
 * @param {GridModel} gridModel
 * @param {Object} options
 */
export function generateHouses(gridModel, options) {
  const {
    numHouses = 10,
    validTiles = [],
  } = options;

  for (let h = 0; h < numHouses; h++) {
    // pick a coordinate to place this region
    const randomLocation = gridModel.findFitPoint(1, 1, (cell) => {
      return cell !== undefined && validTiles.includes(cell.get('tile'));
    });

    if (randomLocation === undefined) {
      return;
    }

    // try not to create a house near another house
    const neighborCells = gridModel.neighbors(randomLocation);
    const homeCells = neighborCells.filter((cell) => {
      if (cell === undefined || cell === null) {
        return false;
      }

      return tileUtils.isHouseTile(cell.get('tile'));
    });

    if (homeCells.length > 0) {
      continue;
    };

    // good location, place it
    const validCell = gridModel.getAt(randomLocation);
    validCell.set({tile: TILE_ID.HOME.HOUSE});
    // placeHouse(gridModel, randomLocation);
  }
}
/**
 * determines what decor to generate on the tile
 *
 * @param {GridModel} mapGridModel
 * @param {Point} location
 */
export function placeEncounter(mapGridModel, location) {
  // wip - use the tile as a tag for searching
  const tile = mapGridModel.getAt(location).get('tile');

  // if it's a House tile (this should never happen)
  if (tileUtils.isHouseTile(tile)) {
    placeHouse(mapGridModel, location);
    return;
  }

  // at the base level, include filter to have the tile the encounter is on
  const tilesToSearch = [tile];

  // find an encounter and model using this criteria
  const encounterModel = gameState.generateRandomEncounter({
    location: location,
    dataType: DATA_TYPE.ENCOUNTER,
    isGeneratable: true,
    rarityId: pickRandomWeightedChoice(rarityTagChoices),
    includeTiles: tilesToSearch,
  });

  // there are no matches if we get `null`
  if (encounterModel === null) {
    return;
  }

  // add it
  gameState.get('encounterList').push(encounterModel);
}
/**
 * determines what to put as a house
 *
 * @param {GridModel} mapGridModel
 * @param {Point} location
 */
export function placeHouse(mapGridModel, location) {
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
