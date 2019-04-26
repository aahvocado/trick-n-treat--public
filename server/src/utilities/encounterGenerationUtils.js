import {
  TILE_TYPES,
  isWalkableType,
} from 'constants.shared/tileTypes';

// import Point from '@studiomoniker/point';
import EncounterModel from 'models/EncounterModel';

import {getEncounterAttributes} from 'collections/encounterCollections';

import pickRandomWeightedChoice from 'utilities.shared/pickRandomWeightedChoice';
import * as mathUtils from 'utilities.shared/mathUtils';

const encounterChoiceList = [
  {
    weight: 10,
    returns: null,
  }, {
    weight: 3,
    returns: 'ADD_CANDY_BASIC-ENCOUNTER_ID',
  }, {
    weight: 3,
    returns: 'LOSE_CANDY_BASIC-ENCOUNTER_ID',
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
  const encounterId = pickRandomWeightedChoice(encounterChoiceList);
  if (encounterId === null) {
    return null;
  }

  const encounterAttributes = getEncounterAttributes(encounterId);
  return new EncounterModel({
    ...encounterAttributes,
    location: location,
  });
}
