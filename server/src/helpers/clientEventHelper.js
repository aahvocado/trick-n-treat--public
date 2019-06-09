import {GAME_MODE} from 'constants.shared/gameModes';
import {SOCKET_EVENT} from 'constants.shared/socketEvents';
import {SERVER_MODE} from 'constants.shared/gameModes';

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
  const clientId = clientModel.get('clientId');
  const characterModel = gameState.findCharacterByClientId(clientId);
  clientModel.emit(SOCKET_EVENT.GAME.TO_CLIENT.MY_CHARACTER, characterModel.export());
}
/**
 * sends data related to the Lobby if they are in game or now
 */
export function sendLobbyUpdate() {
  const clients = serverState.get('clients');
  logger.lifecycle(`(sendLobbyUpdate() - ${clients.length} clients)`);

  // format the data - these are the same for everyone
  const formattedLobbyData = clients.map((model) => (model.export()));
  const isGameInProgress = serverState.get('mode') === SERVER_MODE.GAME && gameState.get('mode') === GAME_MODE.READY;

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
    sendMyCharacter(clientModel);

    clientModel.emit(SOCKET_EVENT.GAME.TO_CLIENT.UPDATE, {
      mapData: formattedMapData,
      mode: gameState.get('mode'),
      round: gameState.get('round'),
    });
  });
}
