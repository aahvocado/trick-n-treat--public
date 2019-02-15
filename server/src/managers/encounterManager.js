// import encounterCollections from 'collections/encounterCollections';

// import * as gamestateManager from 'managers/gamestateManager';
import * as encounterGenerationUtils from 'utilities/encounterGenerationUtils';

/**
 *
 *
 *
 */

/**
 * list of ids for the current session's list of encounters
 *
 * @type {Array<String>}
 */
const encountersList = [];
/**
 * @returns {Array<String>}
 */
export function getEncountersList() {
  return encountersList;
}
/**
 * gets the model based on id
 *
 * @param {String} id
 * @returns {EncounterModel | undefined}
 */
export function getEncounterModel(id) {
  return encountersList.find((encounterModel) => {
    return encounterModel.id === id;
  })
}
/**
 * generates encounters for each of the encounter tiles in the map
 *
 * @param {MapModel} mapModel
 * @returns {Array<EncounterModel>}
 */
export function generateEncounters(mapModel) {
  return encounterGenerationUtils.generateEncounters(mapModel);
}
