import {GAME_MODES} from 'constants.shared/gameModes';
import {SOCKET_EVENT} from 'constants.shared/socketEvents';
import {SERVER_MODES} from 'constants.shared/gameModes';

import * as gamestateDataHelper from 'helpers/gamestateDataHelper';

import gameState from 'state/gameState';
import serverState from 'state/serverState';

import logger from 'utilities/logger.game';

import * as conditionHandlerUtils from 'utilities/conditionHandlerUtils';
import * as jsonDataUtils from 'utilities.shared/jsonDataUtils';

/**
 * sends data to all Clients
 */
export function sendGameEnd() {
  const clients = serverState.get('clients');
  logger.lifecycle(`(sendGameEnd() - ${clients.length} clients)`);
  clients.forEach((client) => {
    client.emit(SOCKET_EVENT.GAME.TO_CLIENT.END);
  });
}
/**
 * send updated data to show that the User needs to handle an Event
 *
 * @param {ClientModel} clientModel
 * @param {EncounterModel} encounterModel
 */
export function sendEncounterToClient(clientModel, encounterModel) {
  // if no `encounterModel` is `null` then it means we want to clear out the data
  if (encounterModel === null) {
    logger.verbose(`. (sendEncounterToClient() - clearing out encounter for "${clientModel.get('name')}")`);
    clientModel.emit(SOCKET_EVENT.GAME.TO_CLIENT.ENCOUNTER, null);
    return;
  }

  // otherwise send formatted data
  logger.verbose(`. (sendEncounterToClient() - "${clientModel.get('name')}")`);
  const clientId = clientModel.get('clientId');
  const characterModel = gameState.findCharacterByClientId(clientId);
  const formattedEncounterData = createFormattedEncounterData(encounterModel, characterModel);
  clientModel.emit(SOCKET_EVENT.GAME.TO_CLIENT.ENCOUNTER, formattedEncounterData);
}
/**
 * send updated data to show that the User needs to handle an Event
 *
 * @param {ClientModel} clientModel
 */
export function sendMyCharacter(clientModel) {
  logger.verbose(`. (sendMyCharacter() - "${clientModel.get('name')}")`);
  clientModel.emit(SOCKET_EVENT.GAME.TO_CLIENT.MY_CHARACTER, clientModel.export());
}
/**
 * sends data related to the Lobby if they are in game or now
 */
export function sendLobbyUpdate() {
  const clients = serverState.get('clients');
  logger.lifecycle(`(sendLobbyUpdate() - ${clients.length} clients)`);

  // format the data - these are the same for everyone
  const formattedLobbyData = createFormattedLobbyData();
  const isGameInProgress = serverState.get('mode') === SERVER_MODES.GAME && gameState.get('mode') === GAME_MODES.ACTIVE;

  // send each Client the data and individual info
  clients.forEach((clientModel) => {
    clientModel.emit(SOCKET_EVENT.LOBBY.TO_CLIENT.UPDATE, {
      isGameInProgress: isGameInProgress,
      lobbyData: formattedLobbyData,

      isInLobby: clientModel.get('isInLobby'),
      isInGame: clientModel.get('isInGame'),
    });
  });
}
/**
 * sends data related to the Game and a Client's character
 */
export function sendGameUpdate() {
  const clients = serverState.get('clients');
  logger.lifecycle(`(sendGameUpdate() - ${clients.length} clients)`);

  // format the data as it will be the same for everyone
  const formattedMapData = gamestateDataHelper.getFormattedMapData();

  // send each Client the data and their individual info
  clients.forEach((clientModel) => {
    const clientId = clientModel.get('clientId');
    const characterModel = gameState.findCharacterByClientId(clientId);

    clientModel.emit(SOCKET_EVENT.GAME.TO_CLIENT.UPDATE, {
      mapData: formattedMapData,
      mode: gameState.get('mode'),
      round: gameState.get('round'),

      myCharacter: createFormattedCharacterData(characterModel),
    });
  });
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
      _doesMeetConditions: conditionHandlerUtils.doesMeetAllConditions(characterModel, jsonDataUtils.getConditionList(actionData)),
    })),

    triggerList: baseEncounterData.triggerList.map((triggerData) => ({
      ...triggerData,
      _doesMeetConditions: conditionHandlerUtils.doesMeetAllConditions(characterModel, jsonDataUtils.getConditionList(triggerData)),
    })),
  };
}
/**
 * formats an CharacterModel's data with some extra properties for sending out
 *
 * - looks at character's inventory and determines if the character can use it
 *  by adding `_doesMeetConditions: Boolean`
 *
 * @param {CharacterModel} characterModel
 * @returns {Object}
 */
function createFormattedCharacterData(characterModel) {
  if (characterModel === undefined) {
    return;
  }

  // format each item
  const inventory = characterModel.get('inventory');
  const formattedInventory = inventory.map((itemModel) => {
    return createFormattedItemData(itemModel, characterModel);
  });

  return {
    ...characterModel.export(),
    inventory: formattedInventory,
  };
}
/**
 * formats an ItemModel's data
 * @todo
 *
 * @param {ItemModel} itemModel
 * @param {CharacterModel} characterModel
 * @returns {Object}
 */
function createFormattedItemData(itemModel, characterModel) {
  if (itemModel === undefined) {
    return;
  }

  const conditionList = itemModel.get('conditionList');
  return {
    ...itemModel.export(),
    _doesMeetConditions: conditionHandlerUtils.doesMeetAllConditions(characterModel, conditionList),
  };
}
/**
 * formats data of the state of all the Clients
 *
 * @returns {Object}
 */
function createFormattedLobbyData() {
  const clients = serverState.get('clients').slice();

  // also generate some data for the other Clients
  const lobbyData = clients.map((client) => {
    return {
      clientType: client.get('clientType'),
      name: client.get('name'),
      isInLobby: client.get('isInLobby'),
      isInGame: client.get('isInGame'),
    };
  });

  return lobbyData;
}
// -- debugging dev stuff
/**
 * send data to a client's `appLog`
 *
 * @param {ClientModel} clientModel
 * @param {String} logString
 */
export function sendToClientLog(clientModel, logString) {
  clientModel.emit(SOCKET_EVENT.DEBUG.TO_CLIENT.ADD_LOG, logString);
}
/**
 * send data to a client's TileEditor
 *
 * @param {String} matrix
 */
export function sendToTileEditor(matrix) {
  const clients = serverState.get('clients');
  clients.forEach((clientModel) => {
    clientModel.emit(SOCKET_EVENT.DEBUG.TO_CLIENT.SET_TILE_EDITOR, matrix);
  });
}
/**
 * send current TileMapModel's mapHistory to client
 *
 * @param {ClientModel} clientModel
 */
export function sendMapHistoryToClient(clientModel) {
  const tileMapModel = gameState.get('tileMapModel');
  clientModel.emit(SOCKET_EVENT.DEBUG.TO_CLIENT.SET_MAP_HISTORY, tileMapModel.get('mapHistory'));
}
