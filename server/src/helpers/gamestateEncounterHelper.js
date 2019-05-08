import {ENCOUNTER_TRIGGER_ID} from 'constants.shared/encounterTriggers';

import gameState from 'data/gameState';

import EncounterModel from 'models/EncounterModel';

import * as gamestateActionHelper from 'helpers/gamestateActionHelper';
import {getEncounterDataById} from 'helpers.shared/encounterDataHelper';

import {sendEncounterToClientByUser} from 'managers/clientManager';

import logger from 'utilities/logger.game';
import * as encounterConditionUtils from 'utilities/encounterConditionUtils';
import * as encounterTriggerUtils from 'utilities/encounterTriggerUtils';

import * as encounterDataUtils from 'utilities.shared/encounterDataUtils';

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
  const evaluatedEncounterData = createEvaluatedEncounterData(characterModel, encounterModel);
  const userModel = gameState.findUserByCharacterId(characterModel.get('characterId'));
  sendEncounterToClientByUser(userModel, evaluatedEncounterData);
}
/**
 * the Action that was chosen takes User to another Encounter
 *
 * @param {UserModel} userModel
 * @param {EncounterId} encounterId
 */
export function handleEncounterActionGoTo(userModel, encounterId) {
  const userId = userModel.get('userId');
  const characterModel = gameState.findCharacterByUserId(userId);

  // find the data and create the next Encounter to go to
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
  triggerList.forEach((encounterTriggerData) => {
    resolveTrigger(encounterTriggerData, characterModel);
  });

  logger.old(`[[done resolving Triggers]]`);
}
/**
 * resolves an individual TriggerData for the character
 * @todo - I intentionally separated these into separate functions even though they are a simple +/- in anticipation
 *  of different side effects needing to be handled in the future
 *
 * @param {EncounterTriggerData} encounterTriggerData
 * @param {CharacterModel} characterModel
 */
export function resolveTrigger(encounterTriggerData, characterModel) {
  const conditionList = encounterDataUtils.getTriggerConditionList(encounterTriggerData);
  if (!encounterConditionUtils.doesMeetAllConditions(characterModel, conditionList)) {
    return;
  }

  const triggerId = encounterDataUtils.getTriggerId(encounterTriggerData);

  logger.verbose(`. [[resolving trigger '${triggerId}']]`);

  // Add Candy
  if (triggerId === ENCOUNTER_TRIGGER_ID.CANDY.ADD) {
    encounterTriggerUtils.handleAddCandyTrigger(characterModel, encounterTriggerData);
  }
  // Lose Candy
  if (triggerId === ENCOUNTER_TRIGGER_ID.CANDY.SUBTRACT) {
    encounterTriggerUtils.handleLoseCandyTrigger(characterModel, encounterTriggerData);
  }

  //
  if (triggerId === ENCOUNTER_TRIGGER_ID.HEALTH.ADD) {
    encounterTriggerUtils.handleAddHealthTrigger(characterModel, encounterTriggerData);
  }
  //
  if (triggerId === ENCOUNTER_TRIGGER_ID.HEALTH.SUBTRACT) {
    encounterTriggerUtils.handleLoseHealthTrigger(characterModel, encounterTriggerData);
  }

  //
  if (triggerId === ENCOUNTER_TRIGGER_ID.MOVEMENT.ADD) {
    encounterTriggerUtils.handleAddMovementTrigger(characterModel, encounterTriggerData);
  }
  //
  if (triggerId === ENCOUNTER_TRIGGER_ID.MOVEMENT.SUBTRACT) {
    encounterTriggerUtils.handleLoseMovementTrigger(characterModel, encounterTriggerData);
  }

  //
  if (triggerId === ENCOUNTER_TRIGGER_ID.SANITY.ADD) {
    encounterTriggerUtils.handleAddSanityTrigger(characterModel, encounterTriggerData);
  }
  //
  if (triggerId === ENCOUNTER_TRIGGER_ID.SANITY.SUBTRACT) {
    encounterTriggerUtils.handleLoseSanityTrigger(characterModel, encounterTriggerData);
  }

  //
  if (triggerId === ENCOUNTER_TRIGGER_ID.VISION.ADD) {
    encounterTriggerUtils.handleAddVisionTrigger(characterModel, encounterTriggerData);
  }
  //
  if (triggerId === ENCOUNTER_TRIGGER_ID.VISION.SUBTRACT) {
    encounterTriggerUtils.handleLoseVisionTrigger(characterModel, encounterTriggerData);
  }

  //
  if (triggerId === ENCOUNTER_TRIGGER_ID.LUCK.ADD) {
    encounterTriggerUtils.handleAddLuckTrigger(characterModel, encounterTriggerData);
  }
  //
  if (triggerId === ENCOUNTER_TRIGGER_ID.LUCK.SUBTRACT) {
    encounterTriggerUtils.handleLoseLuckTrigger(characterModel, encounterTriggerData);
  }

  //
  if (triggerId === ENCOUNTER_TRIGGER_ID.GREED.ADD) {
    encounterTriggerUtils.handleAddGreedTrigger(characterModel, encounterTriggerData);
  }
  //
  if (triggerId === ENCOUNTER_TRIGGER_ID.GREED.SUBTRACT) {
    encounterTriggerUtils.handleLoseGreedTrigger(characterModel, encounterTriggerData);
  }

  //
  if (triggerId === ENCOUNTER_TRIGGER_ID.CHANGE_POSITION) {
    encounterTriggerUtils.handleChangePositionTrigger(characterModel, encounterTriggerData);
  }
}
/**
 * formats an EncounterModel's data with some extra properties for sending out
 *
 * - looks for any Actions or Triggers that have a Condition,
 *  then adds a `_doesMeetConditions: Boolean` for if the Character meets the condition
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterModel} encounterModel
 * @returns {Object} - should return a structure similar to EncounterData
 */
export function createEvaluatedEncounterData(characterModel, encounterModel) {
  const baseEncounterData = encounterModel.exportEncounterData();

  return {
    ...baseEncounterData,

    actionList: baseEncounterData.actionList.map((actionData) => ({
      ...actionData,
      _doesMeetConditions: encounterConditionUtils.doesMeetAllConditions(characterModel, encounterDataUtils.getActionConditionList(actionData)),
    })),

    triggerList: baseEncounterData.triggerList.map((triggerData) => ({
      ...triggerData,
      _doesMeetConditions: encounterConditionUtils.doesMeetAllConditions(characterModel, encounterDataUtils.getTriggerConditionList(triggerData)),
    })),
  };
}
