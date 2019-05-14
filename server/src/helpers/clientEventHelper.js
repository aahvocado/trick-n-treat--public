import {SOCKET_EVENTS} from 'constants.shared/socketEvents';

import gameState from 'data/gameState';
import serverState from 'data/serverState';

import * as gamestateDataHelper from 'helpers/gamestateDataHelper';

import logger from 'utilities/logger.game';

import * as encounterConditionUtils from 'utilities/encounterConditionUtils';
import * as encounterDataUtils from 'utilities.shared/encounterDataUtils';

/**
 * creates some State data for a Remote Client
 *
 * @param {SocketClientModel} clientModel
 * @returns {Object} - for the Remote
 */
function generateClientGameData(clientModel) {
  return {
    isInLobby: clientModel.get('isInLobby'),
    isInGame: clientModel.get('isInGame'),
    ...getClientUserAndCharacter(clientModel.get('userId')),
  };
}
/**
 * sends data to all Clients
 */
export function sendUpdateToAllClients() {
  const clients = serverState.get('clients');
  logger.lifecycle(`(sendUpdateToAllClients() - ${clients.length} clients)`);
  clients.forEach((client) => {
    sendUpdateToClient(client);
  });
}
/**
 * sends data to a User by finding its associated Client
 *
 * @param {SocketClientModel} clientModel
 */
export function sendUpdateToClient(clientModel) {
  logger.verbose(`. (sendUpdateToClient() - "${clientModel.get('name')}")`);
  clientModel.emit(SOCKET_EVENTS.UPDATE.CLIENT, generateClientGameData(clientModel));
  clientModel.emit(SOCKET_EVENTS.UPDATE.GAME, gamestateDataHelper.getFormattedGamestateData());
}
/**
 * send updated data to show that the User needs to handle an Event
 *
 * @param {SocketClientModel} clientModel
 * @param {EncounterModel} encounterModel
 */
export function sendEncounterToClient(clientModel, encounterModel) {
  // if no `encounterModel` is `null` then it means we want to clear out the data
  if (encounterModel === null) {
    logger.verbose(`. (sendEncounterToClient() - clearing out encounter for "${clientModel.get('name')}")`);
    clientModel.emit(SOCKET_EVENTS.GAME.ENCOUNTER, null);
    return;
  }

  // otherwise send formatted data
  logger.verbose(`. (sendEncounterToClient() - "${clientModel.get('name')}")`);
  const userId = clientModel.get('userId');
  const characterModel = gameState.findCharacterByUserId(userId);
  const formattedEncounterData = createFormattedEncounterData(encounterModel, characterModel);
  clientModel.emit(SOCKET_EVENTS.GAME.ENCOUNTER, formattedEncounterData);
}
/**
 * send updated data to show that the User needs to handle an Event
 *
 * @param {SocketClientModel} clientModel
 */
export function sendMyCharacter(clientModel) {
  logger.verbose(`. (sendMyCharacter() - "${clientModel.get('name')}")`);
  clientModel.emit(SOCKET_EVENTS.UPDATE.MY_CHARACTER, clientModel.export());
}
/**
 * @param {String} userId
 * @returns {Object}
 */
function getClientUserAndCharacter(userId) {
  const characterModel = gameState.findCharacterByUserId(userId);
  const userModel = gameState.findUserById(userId);

  if (characterModel === undefined || userModel === undefined) {
    return;
  }

  return {
    myCharacter: characterModel.export(),
    myUser: userModel.export(),
  };
}
/**
 * formats an EncounterModel's data with some extra properties for sending out
 *
 * - looks for any Actions or Triggers that have a Condition,
 *  then adds a `_doesMeetConditions: Boolean` for if the Character meets the condition
 *
 * @param {EncounterModel} encounterModel
 * @param {CharacterModel} characterModel
 * @returns {Object} - should return a structure similar to EncounterData
 */
function createFormattedEncounterData(encounterModel, characterModel) {
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
