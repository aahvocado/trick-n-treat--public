import {GAME_MODES} from 'constants/gameModes';
import {SOCKET_EVENTS} from 'constants/socketEvents';

import * as gamestateManager from 'managers/gamestateManager';
import * as serverStateManager from 'managers/serverStateManager';

import {RemoteClientModel, ScreenClientModel} from 'models/SocketClientModel';

/**
 * acts as the middleman between Client connections and the Server state
 */

/**
 * instantiate the manager
 *
 * @param {socket.io-server} io
 */
export function init(io) {
  io.on('connection', (socket) => {
    // create a Client object and add it to the Server State
    const socketClient = handleCreatingNewSocketClient(socket);
    const userId = socketClient.get('userId');

    // client pressed "Game Start"
    socket.on(SOCKET_EVENTS.LOBBY.START, () => {
      serverStateManager.handleStartGame();
    });

    // client took a game action
    socket.on(SOCKET_EVENTS.GAME.ACTION, (actionId) => {
      gamestateManager.handleUserGameAction(userId, actionId);
    });

    // disconnected
    socket.on('disconnect', () => {
      console.log('\x1b[32m', `- Client "${userId}" disconnected`);
      serverStateManager.removeClient(socketClient);
    });
  });

  // -- Server state changes
  /**
   * a change to the number of Lobby Clients
   */
  serverStateManager.onChange('lobbyClients', sendClientStateToAll);

  // -- Game state changes
  /**
   * when Gamestate changes mode
   *  if it's ACTIVE, send data to everyone
   */
  gamestateManager.onChange('mode', (newMode) => {
    if (newMode !== GAME_MODES.ACTIVE) {
      return;
    }

    io.emit(SOCKET_EVENTS.GAME.UPDATE, gamestateManager.exportState());
  });
  /**
   * update everyone when the `activeCharacter` changes
   */
  gamestateManager.onChange('activeCharacter', () => {
    io.emit(SOCKET_EVENTS.GAME.UPDATE, gamestateManager.exportState());
  });
  /**
   * keeping track of remaining moves
   */
  gamestateManager.onChange('remainingMoves', () => {
    io.emit(SOCKET_EVENTS.GAME.UPDATE, gamestateManager.exportState());
  });
}
// -- connection events
/**
 * create a `SocketClientModel` based on the socket
 *
 * @param {Socket} socket
 * @returns {SocketClientModel}
 */
function handleCreatingNewSocketClient(socket) {
  const query = socket.handshake.query;
  const {
    name,
    clientType,
    userId,
  } = query;

  const clientAttributes = {
    name: name,
    userId: userId,
    socket: socket,
    sessionId: socket.id,
    isInLobby: true,
  };

  // connected to a Remote
  if (clientType === 'REMOTE_SOCKET_CLIENT') {
    return createAndAddNewRemoteClient(clientAttributes);
  }

  // connected to a Screen
  if (clientType === 'SCREEN_SOCKET_CLIENT') {
    return createAndAddNewScreenClient(clientAttributes);
  }
}
/**
 * @param {Object} attributes
 * @returns {RemoteClientModel}
 */
function createAndAddNewRemoteClient(attributes) {
  const newClient = new RemoteClientModel(attributes);
  serverStateManager.addClient(newClient);

  console.log('\x1b[92m', `+ Remote "${newClient.get('userId')}" connected`);
  return newClient;
}
/**
 * @param {Object} attributes
 * @returns {ScreenClientModel}
 */
function createAndAddNewScreenClient(attributes) {
  const newClient = new ScreenClientModel(attributes);
  serverStateManager.addClient(newClient);

  console.log('\x1b[92m', `+ Screen "${newClient.get('userId')}" connected`);
  return newClient;
}
// -- individual Client functions
/**
 * creates some State data for a Remote Client
 *
 * @param {SocketClientModel} clientModel
 * @returns {Object} - for the Remote
 */
function generateRemoteClientState(clientModel) {
  const serverState = serverStateManager.getState();

  const lobbyClients = serverState.clients.filter((client) => {
    return client.get('isInLobby');
  });
  const lobbyNames = lobbyClients.map((client) => (client.get('name')));

  return {
    isInLobby: clientModel.get('isInLobby'),
    isInGame: clientModel.get('isInGame'),
    lobbyNames: lobbyNames,
  };
}
// -- group Client functions
/**
 * creates some State data for a Remote Client
 */
function sendClientStateToAll() {
  const clients = serverStateManager.getState().clients.slice();
  clients.forEach((client) => {
    client.emit(SOCKET_EVENTS.CLIENT.UPDATE, generateRemoteClientState(client));
  });
}
