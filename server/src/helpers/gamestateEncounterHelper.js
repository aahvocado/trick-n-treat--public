import * as encounterDataHelper from 'helpers.shared/encounterDataHelper';

import EncounterModel from 'models.shared/EncounterModel';

import gameState from 'state/gameState';

// import logger from 'utilities/logger.game';

import * as encounterDataUtils from 'utilities.shared/encounterDataUtils';
import * as mathUtils from 'utilities.shared/mathUtils';

/**
 * this Helper is for handling data for Encounters
 */

// -- encounterData functions
/**
 * keep track of unused Encounters
 *
 * @type {Array}
 */
let availableEncounterList = [];
/**
 * resets the `availableEncounterList` back to all data
 */
export function resetEncounterHelper() {
  availableEncounterList = encounterDataHelper.ALL_ENCOUNTER_DATA_LIST;
};
/**
 * @param {Object} options
 * @returns {Array<EncounterData>}
 */
export function findAvailableEncounters(options = {}) {
  return encounterDataUtils.filterEncounterList(availableEncounterList, options);
}
/**
 * generates a new EncounterModel of a random Encounter that fits criteria of given options
 * - returns `null` if there are none that match search options
 *
 * @param {Object} options
 * @returns {EncounterModel | null}
 */
export function generateRandomEncounter(options) {
  const {
    location,
    ...searchOptions
  } = options;

  const potentialEncounters = findAvailableEncounters(searchOptions);

  // then choose one randomly from the potential list
  const chosenIdx = mathUtils.getRandomInt(0, potentialEncounters.length - 1);
  const chosenEncounterData = potentialEncounters[chosenIdx];
  if (chosenEncounterData === undefined) {
    return null;
  }

  // remove chosen encounterData if it `isGeneratableOnce`
  if (chosenEncounterData.isGeneratableOnce) {
    availableEncounterList.splice(chosenIdx, 1);
  }

  // create and return the encounter
  return new EncounterModel({
    ...chosenEncounterData,
    location: location,
  });
}
// -- in game functions
/**
 * gets the Encounter if there is one at given point
 *
 * @param {Point} point
 * @returns {EncounterModel | undefined}
 */
export function findEncounterAt(point) {
  const encounterList = gameState.get('encounterList');
  return encounterList.find((encounterModel) => {
    const encounterLocation = encounterModel.get('location');
    return point.equals(encounterLocation);
  });
}
/**
 * @param {EncounterId} encounterId
 * @param {Object} options
 * @returns {EncounterData}
 */
export function findEncounterById(encounterId, options) {
  const {
    location,
  } = options;

  const foundEncounterData = availableEncounterList.find((encounterData) => encounterData.id === encounterId);
  if (foundEncounterData === undefined) {
    return null;
  }

  // create and return the encounter
  return new EncounterModel({
    ...foundEncounterData,
    location: location,
  });
}
