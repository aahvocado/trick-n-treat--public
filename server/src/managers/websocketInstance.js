import SocketServer from 'socket.io';

import ClientModel from 'models/ClientModel';

import serverState from 'state/serverState';

import logger from 'utilities/logger.game';

/** @type {socket.io-server} */
export let io;
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

  // attach listener for when a socket connects
  io.on('connection', onSocketConnect);
}
/**
 * when a new socket connects
 *
 * @param {Socket} socket
 */
function onSocketConnect(socket) {
  const {
    name,
    clientType,
    clientId,
  } = socket.handshake.query;

  // create new Client, which will handle event listeners on its own
  const clientModel = new ClientModel({
    clientType: clientType,
    name: name,
    clientId: clientId,
    socket: socket,
    sessionId: socket.id,
    isInLobby: true,
  });

  // add it to `serverState`
  serverState.get('clientList').push(clientModel);

  // update everyone
  serverState.emitLobbyUpdate();
}
