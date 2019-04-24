import {
  TILE_TYPES,
  isWalkableType,
} from 'constants/tileTypes';
// import {ENCOUNTER_TYPES} from 'constants/encounterTypes';

// import Point from '@studiomoniker/point';
import EncounterModel from 'models/EncounterModel';

import * as encounterCollections from 'collections/encounterCollections';

import pickRandomWeightedChoice from 'utilities/pickRandomWeightedChoice';
import * as mathUtils from 'utilities/mathUtils';

const sidewalkEncounterDataList = [
  {
    weight: 3,
    returns: encounterCollections.addCandyEncounterData,
  }, {
    weight: 1,
    returns: encounterCollections.loseCandyEncounterData,
  }, {
    weight: 10,
    returns: null,
  },
];

// -- Generators pick Encounters based on conditions
/**
 * determines what type of encounter it should generate
 *  but can also choose to generate nothing
 *
 * @param {MapModel} mapModel
 * @param {Point} location
 * @returns {EncounterModel | null}
 */
export function pickSidewalkEncounter(mapModel, location) {
  const encounterData = pickRandomWeightedChoice(sidewalkEncounterDataList);
  if (encounterData === null) {
    return null;
  }

  return new EncounterModel({
    ...encounterData,
    location: location,
  });
}
