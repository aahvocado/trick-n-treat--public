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

  // go ahead and trigger the encounter, since maybe it just changes a value
  if (!encounterModel.get('isActionable')) {
    encounterModel.trigger(characterModel);
  }

  // hrm, clear the actionQueue because we have to handle this immediately
  gamestateActionHelper.clearActionQueue();

  // send the client the data of the Encounter they triggered
  const encounterData = encounterModel.get('encounterData');
  const userModel = gameState.findUserByCharacterId(characterModel.get('characterId'));
  sendEncounterToClientByUser(userModel, encounterData);
}
