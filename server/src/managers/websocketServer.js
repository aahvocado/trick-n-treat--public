import SocketServer from 'socket.io';

/**
 * Singleton for handling the connection
 */

/** @type {socket.io-server} */
let io;

/**
 * required to be called to instantiate the Websocket Server
 *
 * @param {httpServer} httpServer
 */
export function start(httpServer) {
  io = new SocketServer(httpServer);
  console.log('\x1b[36m', 'Websocket Connection Started'); //cyan
}
