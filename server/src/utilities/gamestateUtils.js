import MAP_SETTINGS from 'constants/mapSettings';
import {FOG_TYPES} from 'constants/tileTypes';

import MapModel from 'models/MapModel';

import * as encounterManager from 'managers/encounterManager';

import * as matrixUtils from 'utilities/matrixUtils';

/**
 * generates a MapModel using the base Map Settings
 *
 * @returns {MapModel}
 */
export function createBaseTileMapModel() {
  return createTileMapModel(MAP_SETTINGS);
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
  return encounterManager.generateEncounters(mapModel);
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
 * logs the current order of turns
 *
 * @param {Object} gamestate
 */
export function displayTurnQueue(gamestate) {
  let displayList = '';
  const turnQueue = gamestate.users.slice();
  for (let i = 0; i < turnQueue.length; i++) {
    const name = `"${turnQueue[i].get('name')}"`;
    displayList += `\n${i + 1}. ${name}`;
  }

  console.log('\x1b[93m', 'Turn Order' + displayList);
}
