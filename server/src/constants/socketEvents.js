/**
 * Server
 *
 * @typedef {String} SocketEvent - event names
 */
export const SOCKET_EVENTS = {
  CLIENT: {
    UPDATE: 'SOCKET_EVENTS.CLIENT.UPDATE',
  },
  LOBBY: {
    UPDATE: 'SOCKET_EVENTS.LOBBY.UPDATE',
    START: 'SOCKET_EVENTS.LOBBY.START',
    JOIN: 'SOCKET_EVENTS.LOBBY.JOIN',
  },
  GAME: {
    UPDATE: 'SOCKET_EVENTS.GAME.UPDATE',
    ACTION: 'SOCKET_EVENTS.GAME.ACTION',
  },
};
