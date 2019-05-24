import {TAG_ID} from 'constants.shared/tagIds';

import * as encounterGenerationUtils from 'utilities/encounterGenerationUtils';
import * as mathUtils from 'utilities.shared/mathUtils';

// -- primary
/**
 * generates Houses onto given MapModel
 *
 * @param {MapModel} mapModel
 * @param {BiomeSettings} biomeSettings
 * @returns {Array<EncounterModel>}
 */
export function generateHouses(mapModel, biomeSettings) {
  const {
    numHouses,
  } = biomeSettings;

  const validLocations = mapModel.getPointsAdjacentToWalkableTile(1, 1, 1);

  const newHousesList = [];
  for (let i=0; i<numHouses; i++) {
    const randomLocationIdx = mathUtils.getRandomIntInclusive(0, validLocations.length - 1);
    const houseLocation = validLocations.splice(randomLocationIdx, 1)[0];

    const newEncounterModel = createHouseEncounter(mapModel, houseLocation);
    newHousesList.push(newEncounterModel);
  }

  return newHousesList;
}
/**
 * picks an Encounter that is meant for houses
 *
 * @param {MapModel} mapModel
 * @param {Point} location
 * @returns {EncounterModel}
 */
export function createHouseEncounter(mapModel, location) {
  const tagsToSearch = [TAG_ID.HOUSE];

  const encounterModel = encounterGenerationUtils.generateRandomEncounter({
    location: location,
    includeTags: tagsToSearch,
    excludeTags: [TAG_ID.DEBUG],
  });

  // there are no matches if we get `null`
  if (encounterModel === null) {
    return;
  }

  return encounterModel;
}
