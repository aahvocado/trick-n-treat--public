import * as serverAppState from 'data/serverAppState';

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

    // disconnected
    socket.on('disconnect', () => {
      serverAppState.removeClient(socketClient);
    });
  });

  // event reactions
  serverAppState.onChange('lobbyClients', sendClientStateToAll);
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
  serverAppState.addClient(newClient);

  console.log(`+ Remote "${newClient.get('userId')}" connected`);
  return newClient;
}
/**
 * @param {Object} attributes
 * @returns {ScreenClientModel}
 */
function createAndAddNewScreenClient(attributes) {
  const newClient = new ScreenClientModel(attributes);
  serverAppState.addClient(newClient);

  console.log(`+ Screen "${newClient.get('userId')}" connected`);
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
  const serverState = serverAppState.getState();

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
  const serverState = serverAppState.getState();

  serverState.clients.forEach((client) => {
    client.emit('CLIENT_STATE_UPDATE', generateRemoteClientState(client));
  });
}
