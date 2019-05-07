import {TAG_ID} from 'constants.shared/tagConstants';
// import {
//   TILE_TYPES,
//   isWalkableType,
// } from 'constants.shared/tileTypes';

import * as encounterDataHelper from 'helpers.shared/encounterDataHelper';

import EncounterModel from 'models/EncounterModel';

import * as mathUtils from 'utilities.shared/mathUtils';

/**
 * generates a new EncounterModel of a random Encounter that fits criteria of given options
 * - returns `null` if there are none that match search options
 *
 * @param {Object} options
 * @property {Point} options.location
 * @property {Array} [options.includeTags]
 * @property {Array} [options.excludeTags]
 * @returns {EncounterModel | null}
 */
export function generateRandomEncounter(options) {
  const {
    location,

    ...searchOptions
  } = options;

  const potentialEncounters = encounterDataHelper.findEncounterData(searchOptions);

  // then choose one randomly from the potential list
  const chosenEncounterIdx = mathUtils.getRandomIntInclusive(0, potentialEncounters.length - 1);
  const chosenEncounterData = potentialEncounters[chosenEncounterIdx];

  if (chosenEncounterData === undefined) {
    return null;
  }

  // create and return the encounter
  return new EncounterModel({
    ...chosenEncounterData,
    location: location,
  });
}
