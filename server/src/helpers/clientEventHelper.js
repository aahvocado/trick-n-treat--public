import {GAME_MODES} from 'constants.shared/gameModes';
import {SOCKET_EVENT} from 'constants.shared/socketEvents';
import {SERVER_MODES} from 'constants.shared/gameModes';

import * as gamestateDataHelper from 'helpers/gamestateDataHelper';

import gameState from 'state/gameState';
import serverState from 'state/serverState';

import logger from 'utilities/logger.game';

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
  // clear out activeEncounter if `encounterModel` is `null`
  if (encounterModel === null) {
    logger.verbose(`. (sendEncounterToClient() to close Encounter for "${clientModel.get('name')}")`);
    clientModel.emit(SOCKET_EVENT.GAME.TO_CLIENT.CLOSE_ENCOUNTER);
    return;
  }

  // send formatted data
  logger.verbose(`. (sendEncounterToClient() to "${clientModel.get('name')}")`);
  clientModel.emit(SOCKET_EVENT.GAME.TO_CLIENT.ENCOUNTER, encounterModel.export());
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
  const formattedLobbyData = clients.map((model) => (model.export()));
  const isGameInProgress = serverState.get('mode') === SERVER_MODES.GAME && gameState.get('mode') === GAME_MODES.ACTIVE;

  // send each Client the data and individual info
  clients.forEach((clientModel) => {
    clientModel.emit(SOCKET_EVENT.LOBBY.TO_CLIENT.UPDATE, {
      isGameInProgress: isGameInProgress,
      lobbyData: formattedLobbyData,
      ...clientModel.export(),
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

      myCharacter: characterModel.export(),
    });
  });
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
