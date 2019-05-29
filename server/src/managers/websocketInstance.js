import SocketServer from 'socket.io';

import * as clientEventHelper from 'helpers/clientEventHelper';

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
  io.on('connection', (socket) => {
    onSocketConnect(socket);

    // -- socket.io events
    socket.on('disconnect', () => {
      logger.old(`- Client "${clientModel.get('name')}" disconnected`);
      serverState.removeClient(clientModel);
    });
  });
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
  logger.new(`+ Client "${clientModel.get('name')}" connected`);

  // add it to `serverState`
  serverState.addClient(clientModel);

  // update everyone
  clientEventHelper.sendLobbyUpdate();
}
