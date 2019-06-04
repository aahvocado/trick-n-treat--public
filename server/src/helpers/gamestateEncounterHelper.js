import * as clientEventHelper from 'helpers/clientEventHelper';
import * as gamestateActionHelper from 'helpers/gamestateActionHelper';

import gameState from 'state/gameState';
import serverState from 'state/serverState';

import logger from 'utilities/logger.game';
import * as triggerHandlerUtil from 'utilities/triggerHandlerUtil';

import * as conditionUtils from 'utilities.shared/conditionUtils';

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
  logger.verbose(`(encountered "${encounterModel.get('id')}" at [x: ${encounterLocation.x}, y: ${encounterLocation.y}])`);

  // check if the character on here can actually trigger this
  if (!encounterModel.canBeEncounteredBy(characterModel)) {
    logger.verbose(`. but ${characterModel.get('name')} can not activate it.`);
    return;
  }

  // track the `activeEncounter`
  gameState.set({activeEncounter: encounterModel});

  // clear the actionQueue because we have to handle this immediately
  //  this might cause issues and skip events, so we need to keep an eye on this
  gamestateActionHelper.clearActionQueue();

  // resolve all the triggers
  const triggerList = encounterModel.get('triggerList');
  triggerList.forEach((triggerData) => {
    // check if this Character meets the individual condition for this Trigger
    if (!conditionUtils.doesMeetAllConditions(triggerData.conditionList, characterModel, encounterModel)) {
      return;
    }

    // resolve it
    triggerHandlerUtil.resolveTrigger(triggerData, characterModel);
  });

  // add a visit - specifically after the Triggers
  encounterModel.addVisit(characterModel);

  // send the client the data of the Encounter they triggered
  const clientModel = serverState.findClientByCharacter(characterModel);
  clientEventHelper.sendEncounterToClient(clientModel, encounterModel);
}
/**
 * the Choice takes the Character to another Encounter
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterModel} encounterModel
 */
export function handleChoiceGoTo(characterModel, encounterModel) {
  logger.verbose(`(choice goes to ${encounterModel.get('id')})`);
  handleCharacterTriggerEncounter(characterModel, encounterModel);
};
/**
 * Trick choice
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterModel} encounterModel
 */
export function handleChoiceTrick(characterModel, encounterModel) {
  encounterModel.addToArray('trickers', characterModel);

  logger.verbose(`(trick choice goes to ${encounterModel.get('id')})`);
  handleCharacterTriggerEncounter(characterModel, encounterModel);
};
/**
 * Treat choice
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterModel} encounterModel
 */
export function handleChoiceTreat(characterModel, encounterModel) {
  encounterModel.addToArray('treaters', characterModel);

  logger.verbose(`(treat choice goes to ${encounterModel.get('id')})`);
  handleCharacterTriggerEncounter(characterModel, encounterModel);
};
