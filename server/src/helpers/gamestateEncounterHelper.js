import EncounterModel from 'models.shared/EncounterModel';

import * as clientEventHelper from 'helpers/clientEventHelper';
import * as gamestateActionHelper from 'helpers/gamestateActionHelper';

import {getEncounterDataById} from 'helpers.shared/encounterDataHelper';

import gameState from 'state/gameState';
import serverState from 'state/serverState';

import logger from 'utilities/logger.game';
import * as triggerHandlerUtil from 'utilities/triggerHandlerUtil';

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

  // check if the character on here can actually trigger this
  if (!encounterModel.canTrigger(characterModel)) {
    return;
  }

  // cache the `activeEncounter`
  gameState.set({activeEncounter: encounterModel});

  // clear the actionQueue because we have to handle this immediately
  //  this might cause issues and skip events, so we need to keep an eye on this
  gamestateActionHelper.clearActionQueue();

  // first resolve all the triggers
  resolveTriggerList(encounterModel, characterModel);

  // then update the Encounter to say it has been
  encounterModel.trigger(characterModel);

  // send the client the data of the Encounter they triggered
  const clientModel = serverState.findClientByCharacter(characterModel);
  clientEventHelper.sendEncounterToClient(clientModel, encounterModel);
}
/**
 * the Action that was chosen takes Character to another Encounter
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterId} encounterId
 */
export function handleEncounterActionGoTo(characterModel, encounterId) {
  // find the data of the Encounter it is going to and create a Model out of it
  const encounterData = getEncounterDataById(encounterId);
  const newEncounterModel = new EncounterModel(encounterData);

  // trigger the Encounter
  logger.verbose(`(encounter action goes to ${newEncounterModel.get('id')})`);
  handleCharacterTriggerEncounter(characterModel, newEncounterModel);
};
/**
 * handles each of the triggers in an encounter
 *
 * @param {EncounterModel} encounterModel
 * @param {CharacterModel} characterModel
 */
export function resolveTriggerList(encounterModel, characterModel) {
  logger.new(`[[resolving Triggers in "${encounterModel.get('id')}"]]`);

  const triggerList = encounterModel.get('triggerList');
  triggerList.forEach((triggerData) => {
    triggerHandlerUtil.resolveTrigger(triggerData, characterModel);
  });

  logger.old(`[[done resolving Triggers]]`);
}
