import io from 'socket.io-client';
import { SocketConfig } from 'constants/server.js';

/**
 * Singleton for handling Websocket Server
 */

/** @type {socket.io-client} */
export let socket;

/**
 * required to be called to instantiate the Socket Client
 *
 * @returns {socket.io-client} - gives back the socket that made the connection attempt
 */
export function connect() {
  socket = io.connect(SocketConfig.server_url, {
    reconnect: false,
    reconnectionAttempts: 1,
    query: {
      clientType: 'SCREEN_SOCKET_CLIENT',
      userId: `screen-client-${Date.now()}`,
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
  }
};
