import {CLIENT_TYPES} from 'constants/clientTypes';
import {SERVER_MODES} from 'constants/gameModes';
import {SOCKET_EVENTS} from 'constants/socketEvents';

import serverState from 'data/serverState';

import * as gamestateDataHelper from 'helpers/gamestateDataHelper';
import * as gamestateUserHelper from 'helpers/gamestateUserHelper';

import {SocketClientModel} from 'models/SocketClientModel';

import logger from 'utilities/logger';

/**
 * acts as the middleman between Client connections and the Server state
 */

/**
 * instantiate the manager
 *
 * @param {socket.io-server} io
 */
export function init(io) {
  io.on('connection', onSocketConnect);

  // -- Server state changes
  /**
   * when Lobby changes, send data to those in Lobby
   */
  serverState.onChange('lobbyClients', (lobbyClients) => {
    lobbyClients.forEach((client) => {
      client.emit(SOCKET_EVENTS.CLIENT.UPDATE, generateClientLobbyData(client));
    });
  });
}
// -- connection events
/**
 * when a new socket connects
 *
 * @param {Socket} socket
 */
function onSocketConnect(socket) {
  const clientModel = handleCreatingNewSocketClient(socket);
  attachClientEvents(clientModel);
}
/**
 * add websocket event handlers
 *
 * @param {SocketClientModel} clientModel
 */
function attachClientEvents(clientModel) {
  const socket = clientModel.get('socket');
  const userId = clientModel.get('userId');

  // client wants to "Game Start"
  socket.on(SOCKET_EVENTS.LOBBY.START, () => {
    serverState.handleStartGame();
  });

  // client wants to "Join" game in session
  socket.on(SOCKET_EVENTS.LOBBY.JOIN, () => {
    gamestateUserHelper.handleJoinGame(clientModel);
  });

  // client took a game action
  socket.on(SOCKET_EVENTS.GAME.ACTION, (actionId) => {
    gamestateUserHelper.handleUserGameAction(userId, actionId);
  });

  // direct move path action
  socket.on(SOCKET_EVENTS.GAME.MOVE_TO, (position) => {
    gamestateUserHelper.handleUserActionMoveTo(userId, position);
  });
  /**
   * disconnect
   */
  socket.on('disconnect', () => {
    logger.old(`- Client "${clientModel.get('name')}" disconnected`);
    serverState.removeClient(clientModel);
  });
}
/**
 * create a `SocketClientModel` based on the socket
 *
 * @param {Socket} socket
 * @returns {SocketClientModel}
 */
function handleCreatingNewSocketClient(socket) {
  const {
    name,
    clientType,
    userId,
  } = socket.handshake.query;

  const clientAttributes = {
    clientType: clientType === 'SCREEN_SOCKET_CLIENT' ? CLIENT_TYPES.SCREEN : CLIENT_TYPES.REMOTE,
    name: name,
    userId: userId,
    socket: socket,
    sessionId: socket.id,
    isInLobby: true,
  };

  const newClient = new SocketClientModel(clientAttributes);
  serverState.addClient(newClient);

  logger.new(`+ Client "${newClient.get('name')}" connected`);
  return newClient;
}
// -- individual Client functions
/**
 * sends data to a User by finding its associated Client
 *
 * @param {UserModel} userModel
 */
export function sendUpdateToClientByUser(userModel) {
  const userId = userModel.get('userId');
  const clientModel = serverState.findClientByUserId(userId);
  if (clientModel === undefined) {
    return;
  };

  sendUpdateToClient(clientModel);
}
/**
 * sends data to a User by finding its associated Client
 *
 * @param {SocketClientModel} clientModel
 */
export function sendUpdateToClient(clientModel) {
  logger.verbose(`. (sending update to client "${clientModel.get('name')}")`);
  clientModel.emit(SOCKET_EVENTS.CLIENT.UPDATE, generateClientGameData(clientModel));
  clientModel.emit(SOCKET_EVENTS.GAME.UPDATE, gamestateDataHelper.getFormattedGamestateData());
}
/**
 * sends data to all Clients
 *
 * @param {SocketClientModel} clientModel
 */
export function sendUpdateToAllClients(clientModel) {
  const clients = serverState.get('clients');
  logger.lifecycle(`(sending updates to all ${clients.length} clients)`);
  clients.forEach((client) => {
    sendUpdateToClient(client);
  });
}
/**
 * creates some State data for a Remote Client
 *
 * @param {SocketClientModel} clientModel
 * @returns {Object} - for the Remote
 */
function generateClientLobbyData(clientModel) {
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

  return {
    isInLobby: clientModel.get('isInLobby'),
    isInGame: clientModel.get('isInGame'),
    isGameInProgress: serverState.get('mode') === SERVER_MODES.GAME,
    lobbyData: lobbyData,
  };
}
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
    ...gamestateUserHelper.getClientUserAndCharacter(clientModel.get('userId')),
  };
}
