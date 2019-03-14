import SocketServer from 'socket.io';

import * as clientManager from 'managers/clientManager';

/** @type {socket.io-server} */
let io;
/**
 * instantiates the Websocket Server
 *  must be called
 *
 * @param {httpServer} httpServer
 */
export function init(httpServer) {
  // instantiate using given server
  io = new SocketServer(httpServer);
  console.log('\x1b[36m', 'Websocket Connection Started'); // cyan

  // instantiate a manager to handle Client connection events
  clientManager.init(io);
}

