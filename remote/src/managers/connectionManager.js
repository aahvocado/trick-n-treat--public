import io from 'socket.io-client';

const SERVER_URL = 'localhost:666';

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
  socket = io.connect(SERVER_URL, {
    reconnect: false,
    reconnectionAttempts: 1,
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
