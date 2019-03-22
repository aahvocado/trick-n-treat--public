import io from 'socket.io-client';

import remoteAppState from 'data/remoteAppState';

const SERVER_URL = 'localhost:666';

/** @type {socket.io-client} */
export let socket;
/**
 * required to be called to instantiate the Socket Client
 *
 * @returns {socket.io-client} - gives back the socket that made the connection attempt
 */
export function connect() {
  socket = io.connect(SERVER_URL, {
    reconnect: false,
    reconnectionAttempts: 1,
    query: {
      clientType: 'REMOTE_SOCKET_CLIENT',
      name: remoteAppState.get('name'),
      userId: remoteAppState.get('userId'),
    },
  });

  return socket;
}
/**
 * if connected once before and now disconnected, can be called this to reconnect
 */
export function reconnect() {
  if (socket) {
    socket.io.reconnect();
    remoteAppState.set({isReconnecting: true});
  }
};
