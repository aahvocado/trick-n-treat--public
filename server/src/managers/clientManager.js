import {GAME_MODES, SERVER_MODES} from 'constants/gameModes';
import {SOCKET_EVENTS} from 'constants/socketEvents';

import gameState from 'data/gameState';
import serverState from 'data/serverState';

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

    // client wants to "Game Start"
    socket.on(SOCKET_EVENTS.LOBBY.START, () => {
      serverState.handleStartGame();
    });

    // client wants to "Join" game in session
    socket.on(SOCKET_EVENTS.LOBBY.JOIN, () => {
      gameState.handleJoinGame(socketClient);
    });

    // client took a game action
    socket.on(SOCKET_EVENTS.GAME.ACTION, (actionId) => {
      gameState.handleUserGameAction(userId, actionId);
    });

    socket.on(SOCKET_EVENTS.GAME.MOVE_TO, (position) => {
      gameState.handleUserActionMoveTo(userId, position);
    });

    // -- gamestate changes
    /**
     * remainingMoves
     */
    gameState.onChange('remainingMoves', () => {
      const activeUser = gameState.get('activeUser');
      if (activeUser !== null && activeUser.get('userId') === userId) {
        socket.emit(SOCKET_EVENTS.CLIENT.UPDATE, generateClientGameData(socketClient));
        socket.emit(SOCKET_EVENTS.GAME.UPDATE, gameState.export());
      }
    });
    /**
     * activeUser
     */
    gameState.onChange('activeUser', (activeUser) => {
      if (activeUser !== null && activeUser.get('userId') === userId) {
        socket.emit(SOCKET_EVENTS.CLIENT.UPDATE, generateClientGameData(socketClient));
        socket.emit(SOCKET_EVENTS.GAME.UPDATE, gameState.export());
      }
    });
    // -- socket events
    /**
     * disconnect
     */
    socket.on('disconnect', () => {
      console.log('\x1b[32m', `- Client "${userId}" disconnected`);
      serverState.removeClient(socketClient);
    });
  });

  // -- Server state changes
  /**
   * when Lobby changes, send data to those in Lobby
   */
  serverState.onChange('lobbyClients', (lobbyClients) => {
    lobbyClients.forEach((client) => {
      client.emit(SOCKET_EVENTS.CLIENT.UPDATE, generateClientLobbyData(client));
    });
  });
  /**
   * listen to when the Server switches to Game Mode
   */
  serverState.onChange('mode', (mode) => {
    // if not in Game Mode, do nothing
    if (mode !== SERVER_MODES.GAME) {
      gameState.set({mode: GAME_MODES.INACTIVE});
      return;
    }

    // create `users` based on connected Clients
    serverState.get('clients').forEach((client) => {
      gameState.createUserFromClient(client);
    });

    // initialize the game
    gameState.init();
  });
  // -- Gamestate changes
  /**
   * when Gamestate changes mode
   *  if it's ACTIVE, send data to everyone
   */
  gameState.onChange('mode', (mode) => {
    if (mode !== GAME_MODES.ACTIVE) {
      return;
    }

    const clients = serverState.get('clients');
    clients.forEach((client) => {
      client.emit(SOCKET_EVENTS.CLIENT.UPDATE, generateClientGameData(client));
      client.emit(SOCKET_EVENTS.GAME.UPDATE, gameState.export());
    });

    console.log('\x1b[36m', '(sending updates to clients)');
  });
  /**
   * when Gamestate changes mode
   *  if it's ACTIVE, send data to everyone
   */
  gameState.onChange('users', () => {
    const clients = serverState.get('clients');
    clients.forEach((client) => {
      client.emit(SOCKET_EVENTS.CLIENT.UPDATE, generateClientGameData(client));
      client.emit(SOCKET_EVENTS.GAME.UPDATE, gameState.export());
    });

    console.log('\x1b[36m', '(sending updates to clients)');
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
  serverState.addClient(newClient);

  console.log('\x1b[92m', `+ Remote "${newClient.get('userId')}" connected`);
  return newClient;
}
/**
 * @param {Object} attributes
 * @returns {ScreenClientModel}
 */
function createAndAddNewScreenClient(attributes) {
  const newClient = new ScreenClientModel(attributes);
  serverState.addClient(newClient);

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
    ...gameState.getClientUserAndCharacter(clientModel.get('userId')),
  };
}
