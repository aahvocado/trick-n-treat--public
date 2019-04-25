import {ENCOUNTER_ACTION_IDS} from 'constants/encounterActions';
import {ENCOUNTER_TYPES} from 'constants/encounterTypes';

/**
 * generic encounter actions
 */
export const closeEncounterAction = {
  actionId: ENCOUNTER_ACTION_IDS.CLOSE,
  label: 'Close',
};
/**
 * just some Encounters
 */
export const addCandyEncounterData = {
  typeId: ENCOUNTER_TYPES.LAWN,
  encounterData: {
    id: 'ADD-CANDY-ENCOUNTER-ID',
    title: 'Candy on the Streets',
    content: 'You got a single piece of candy!',
    actions: [closeEncounterAction],
  },
  onTrigger: (characterModel) => {
    characterModel.set({candies: characterModel.get('candies') + 1});
  },
};
export const loseCandyEncounterData = {
  typeId: ENCOUNTER_TYPES.LAWN,
  encounterData: {
    id: 'LOSE-CANDY-ENCOUNTER-ID',
    title: 'Spooky in the Sheets',
    content: 'You lost a candy',
    actions: [closeEncounterAction],
  },
  onTrigger: (characterModel) => {
    characterModel.set({candies: characterModel.get('candies') - 1});
  },
};
