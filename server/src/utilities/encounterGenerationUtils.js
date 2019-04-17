import {TILE_TYPES} from 'constants/tileTypes';
// import {ENCOUNTER_TYPES} from 'constants/encounterTypes';

// import Point from '@studiomoniker/point';
// import EncounterModel from 'models/EncounterModel';

import * as encounterCollections from 'collections/encounterCollections';

import * as mathUtils from 'utilities/mathUtils';

/**
 * generates encounters for each of the encounter tiles in the map
 *
 * @param {MapModel} mapModel
 * @returns {Array<EncounterModel>}
 */
export function generateEncounters(mapModel) {
  const encounterList = [];

  mapModel.forEach((tile, point) => {
    if (tile !== TILE_TYPES.ENCOUNTER) {
      return;
    }

    const newEncounter = generateRandomEncounter(mapModel, point);
    encounterList.push(newEncounter);
  });

  return encounterList;
}
/**
 * generates an Encounter
 *  by determining what type of encounter it should generate
 *
 * @param {MapModel} mapModel
 * @param {Point} location
 * @returns {EncounterModel}
 */
export function generateRandomEncounter(mapModel, location) {
  const typeCounts = mapModel.getTypeCountsAdjacentTo(location);

  const pathCount = typeCounts[TILE_TYPES.PATH];
  const houseCount = typeCounts[TILE_TYPES.HOUSE];

  // street (not adjacent to a house, not at a dead end)
  if (houseCount < 0 && pathCount > 1) {
    return generateRandomStreetEncounter(location);
  }

  // on someone's "lawn", next to exactly one house
  if (houseCount === 1) {
    return generateRandomLawnEncounter(location);
  }

  // fallback if no other rule matches, generic encounter
  return generateRandomGenericEncounter(location);
}
/**
 * generates a Generic Encounter
 *
 * @param {Point} location
 * @returns {EncounterModel}
 */
export function generateRandomGenericEncounter(location) {
  return generateRandomLawnEncounter(location);
}
/**
 * generates a Street Encounter
 *
 * @param {Point} location
 * @returns {EncounterModel}
 */
export function generateRandomStreetEncounter(location) {
  return generateRandomLawnEncounter(location);
}
/**
 * generates a Lawn Encounter
 *
 * @param {Point} location
 * @returns {EncounterModel}
 */
export function generateRandomLawnEncounter(location) {
  const lawnEncounters = encounterCollections.getAllLawnEncounters();
  const randomIndex = mathUtils.getRandomIntInclusive(0, lawnEncounters.length - 1);

  const encounterModel = lawnEncounters[randomIndex].clone();
  encounterModel.set({position: location});

  return encounterModel;
}
