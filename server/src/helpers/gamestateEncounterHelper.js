import {
  ENCOUNTER_TRIGGER_ID,
} from 'constants/encounterConstants';

import gameState from 'data/gameState';

import * as gamestateActionHelper from 'helpers/gamestateActionHelper';

import {sendEncounterToClientByUser} from 'managers/clientManager';

import logger from 'utilities/logger';

/**
 * this Helper is for handling data for Encounters
 */

/**
 * picks a random adjacent point that a given character can be on
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterModel} encounterModel
 */
export function handleCharacterTriggerEncounter(characterModel, encounterModel) {
  const encounterLocation = encounterModel.get('location');
  logger.verbose(`(encounter at [x: ${encounterLocation.x}, y: ${encounterLocation.y}])`);

  // check if there's nothing to trigger with the Encounter
  if (encounterModel.get('triggerList').length <= 0) {
    logger.warning(`Encounter ${encounterModel.get('id')} has no triggers.`);
    return;
  }

  // check if the character on here can actually trigger this
  if (!encounterModel.canTrigger(characterModel)) {
    return;
  }

  // clear the actionQueue because we have to handle this immediately
  //  this might cause issues and skip events, so we need to keep an eye on this
  gamestateActionHelper.clearActionQueue();

  // first resolve all the triggers
  resolveTriggerList(encounterModel, characterModel);

  // then update the Encounter to say it has been
  encounterModel.trigger(characterModel);

  // send the client the data of the Encounter they triggered
  const userModel = gameState.findUserByCharacterId(characterModel.get('characterId'));
  sendEncounterToClientByUser(userModel, encounterModel.exportEncounterData());
}
/**
 * handles each of the triggers in an encounter
 *
 * @param {EncounterModel} encounterModel
 * @param {CharacterModel} characterModel
 */
export function resolveTriggerList(encounterModel, characterModel) {
  const triggerList = encounterModel.get('triggerList');
  triggerList.forEach((triggerData) => {
    const {triggerId} = triggerData;

    // basic Add Candy
    if (triggerId === ENCOUNTER_TRIGGER_ID.CANDY.ADD) {
      handleAddCandyTrigger(characterModel, triggerData);
    }

    // basic Lose Candy
    if (triggerId === ENCOUNTER_TRIGGER_ID.CANDY.SUBTRACT) {
      handleAddCandyTrigger(characterModel, triggerData);
    }
  });
}
/**
 * handles the basic Encounter Trigger of adding candy
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterTriggerData} triggerData
 */
export function handleAddCandyTrigger(characterModel, triggerData) {
  const {value} = triggerData;

  const prevCandyCount = characterModel.get('candies');
  characterModel.set({candies: prevCandyCount + value});
};
/**
 * handles the basic Encounter Trigger of subtracting candy
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterTriggerData} triggerData
 */
export function handleLoseCandyTrigger(characterModel, triggerData) {
  const {value} = triggerData;

  const prevCandyCount = characterModel.get('candies');
  characterModel.set({candies: prevCandyCount - value});
};
