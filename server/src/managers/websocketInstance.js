import SocketServer from 'socket.io';

import * as gamestateManager from 'managers/gamestateManager';
import * as remoteEventManager from 'managers/remoteEventManager';

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

  // instantiate the different communication managers
  remoteEventManager.start(io);
}
/**
 * middleware to intercept new connections
 *  then determine if its Remote or Screen
 *
 * @param {Socket} socket
 * @param {Function} next
 */
function handshake(socket, next) {
  const query = socket.handshake.query;

  gamestateManager.createNewUser({
    id: socket.id,
    name: query.name || 'test',
  });

  next();
}
