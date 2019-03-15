import {observable, toJS} from 'mobx';

import {SOCKET_EVENTS} from 'constants/socketEvents';

// TESTING
const _name = (() => {
  const firsts = ['amazing', 'cool', 'ticklish', 'rainbow', 'cheerful', 'sleepy', 'poopy', 'rectangular', 'transparent', 'plaid', 'laughing'];
  const seconds = ['diamond', 'jello', 'treater', 'tricker', 'pumpkin', 'ghost', 'vampire', 'muppet', 'tattler', 'cowboy', 'pokemon', 'triangle'];

  const randomChoice = (list) => (list[Math.floor(Math.random()*list.length)]);

  return `${randomChoice(firsts)}-${randomChoice(seconds)}`
})();

/**
 * This is the state of the Remote App!
 */
export const appStore = observable({
  // app session data
  name: _name,
  userId: `${_name}-${Date.now()}`,

  // gamestate - from the server
  gamestate: undefined,

  // my client state - from the server
  isInLobby: false,
  isInGame: false,
  lobbyNames: [],

  // websocket connection status
  isConnected: false,
  isReconnecting: false,
});
/**
 * makes changes to the state
 *
 * @param {Object} changes
 */
export function updateState(changes) {
  for (const i in changes) {
    if (Object.prototype.hasOwnProperty.call(changes, i)) {
      appStore[i] = changes[i];
    }
  }
}
/**
 * this gets the non-observable, non-reactable state of the App
 *
 * @returns {Object}
 */
export function getState() {
  return toJS(appStore);
}
/**
 * add Websocket listeners
 */
export function attachSocketListeners(socket) {
  // received new Gamestate from Server
  socket.on(SOCKET_EVENTS.GAME.UPDATE, (data) => {
    updateState({
      gamestate: data,
    });
  });
  // -- client
  socket.on(SOCKET_EVENTS.CLIENT.UPDATE, (data) => {
    updateState({
      isInLobby: data.isInLobby,
      isInGame: data.isInGame,
      lobbyNames: data.lobbyNames,
    });
  });

  // -- connection stuff
  socket.on('connect', () => {
    updateState({
      isConnected: true,
      isReconnecting: false,
    });
  });

  socket.on('disconnect', () => {
    updateState({
      isConnected: false,
      isReconnecting: false,
    });
  });

  socket.on('reconnect_failed', () => {
    updateState({
      isConnected: false,
      isReconnecting: false,
    });
  });
}
