import {observable} from 'mobx';

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

  // whoa gamestate
  gamestate: undefined,

  // websocket connection status
  isConnected: false,
  isReconnecting: false,

});

/**
 * add Websocket listeners
 */
export function attachSocketListeners(socket) {
  // received new Gamestate from Server
  socket.on('GAMESTATE_UPDATE', (data) => {
    appStore.gamestate = data;
  });

  // -- connection stuff
  socket.on('connect', () => {
    appStore.isConnected = true;
    appStore.isReconnecting = false;
  });

  socket.on('disconnect', () => {
    appStore.isConnected = false;
    appStore.isReconnecting = false;
  });

  socket.on('reconnect_failed', () => {
    appStore.isConnected = false;
    appStore.isReconnecting = false;
  });
}
