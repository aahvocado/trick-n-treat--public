import SocketServer from 'socket.io';

import {RemoteSocketClient, ScreenSocketClient} from 'models/SocketClientModel';

import * as gamestateManager from 'managers/gamestateManager';

/**
 * Singleton for handling the Websocket connection
 */

/** @type {socket.io-server} */
export let io;
/**
 * required to be called to instantiate the Websocket Server
 *
 * @param {httpServer} httpServer
 */
export function start(httpServer) {
  // instantiate using given server
  io = new SocketServer(httpServer);
  console.log('\x1b[36m', 'Websocket Connection Started'); // cyan

  io.use(handshake);

  io.on('connection', (socket) => {
    // when any type of client connects, send them the current Gamestate
    socket.emit('GAMESTATE_UPDATE', gamestateManager.getGamestate());
  });
}
/**
 * middleware to intercept new connections
 *
 * @param {Socket} socket
 * @param {Function} next
 */
function handshake(socket, next) {
  // create a model to manage more easily
  createNewSocketClient(socket);

  next();
}
/**
 * create a `SocketClientModel` based on the socket
 *
 * @param {Socket} socket
 * @returns {SocketClientModel}
 */
function createNewSocketClient(socket) {
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
  };

  // connected to a Remote
  if (clientType === 'REMOTE_SOCKET_CLIENT') {
    console.log(`+ Remote Client "${userId}" connected`);

    gamestateManager.createAndAddNewUser({
      name,
      userId,
    });
    return new RemoteSocketClient(clientAttributes);
  }

  // connected to a Screen
  if (clientType === 'SCREEN_SOCKET_CLIENT') {
    console.log(`+ Screen Client "${userId}" connected`);

    return new ScreenSocketClient(clientAttributes);
  }
}
