import SocketServer from 'socket.io';

import * as clientManager from 'managers/clientManager';

import logger from 'utilities/logger.game';

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
  logger.server('Websocket Connection Started');

  // instantiate a manager to handle Client connection events
  clientManager.init(io);
}

