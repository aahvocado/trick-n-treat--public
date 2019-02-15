import ENCOUNTER_TYPES from 'constants/encounterTypes';

import EncounterModel from 'models/EncounterModel';

/**
 * just some Encounters
 */
const addHealthEncounter = new EncounterModel({
  typeId: ENCOUNTER_TYPES.LAWN,
  onTrigger: (characterModel) => {
    const healthModel = characterModel.get('health');
    healthModel.set({ value: healthModel.get('value') + 1 });
  }
});
const bigAddHealthEncounter = new EncounterModel({
  typeId: ENCOUNTER_TYPES.LAWN,
  onTrigger: (characterModel) => {
    const healthModel = characterModel.get('health');
    healthModel.set({ value: healthModel.get('value') + 2 });
  }
});
const loseHealthEncounter = new EncounterModel({
  typeId: ENCOUNTER_TYPES.LAWN,
  onTrigger: (characterModel) => {
    const healthModel = characterModel.get('health');
    healthModel.set({ value: healthModel.get('value') - 1 });
  }
});
const bigLoseHealthEncounter = new EncounterModel({
  typeId: ENCOUNTER_TYPES.LAWN,
  onTrigger: (characterModel) => {
    const healthModel = characterModel.get('health');
    healthModel.set({ value: healthModel.get('value') - 2 });
  }
});
/** @type {Array<EventModel>} */
const lawnEncountersCollection = [
  addHealthEncounter,
  bigAddHealthEncounter,
  loseHealthEncounter,
  bigLoseHealthEncounter,
];
/**
 * this should be a list of every possible Encounter
 *
 * @type {Array<EventModel>}
 */
const allEncountersCollection = [
  ...lawnEncountersCollection,
];
/**
 * @returns {Array<EventModel>}
 */
export function getAllEncounters() {
  return allEncountersCollection.slice();
};

/**
 * @returns {Array<EventModel>}
 */
export function getAllLawnEncounters() {
  return lawnEncountersCollection.slice();
};
