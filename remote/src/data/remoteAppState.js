import {SOCKET_EVENTS} from 'constants/socketEvents';

import Model from 'models/Model';

// TESTING
const _name = (() => {
  const firsts = ['amazing', 'cool', 'ticklish', 'rainbow', 'cheerful', 'sleepy', 'poopy', 'rectangular', 'transparent', 'plaid', 'laughing'];
  const seconds = ['diamond', 'jello', 'treater', 'tricker', 'pumpkin', 'ghost', 'vampire', 'muppet', 'tattler', 'cowboy', 'pokemon', 'triangle'];

  const randomChoice = (list) => (list[Math.floor(Math.random()*list.length)]);

  return `${randomChoice(firsts)}-${randomChoice(seconds)}`
})();
/**
 *
 */
export class RemoteStateModel extends Model {
  /** @override */
  constructor(newAttributes = {}) {
    super({
      // -- app session data
      /** @type {String} */
      name: _name,
      /** @type {String} */
      userId: `${_name}-${Date.now()}`,

      // -- gamestate - from the server
      /** @type {GamestateObject | undefined} */
      gamestate: undefined,
      /** @type {Object | undefined} */
      myCharacter: undefined,
      /** @type {Object | undefined} */
      myUser: undefined,

      // -- my client state - from the server
      /** @type {Boolean} */
      isInLobby: true,
      /** @type {Boolean} */
      isInGame: false,
      /** @type {Array<String>} */
      lobbyData: [],

      // -- websocket connection status
      /** @type {Boolean} */
      isConnected: false,
      /** @type {Boolean} */
      isReconnecting: false,
    });
  }
  /**
   * attach listeners to the websocket
   */
  attachSocketListeners(socket) {
    // received new Gamestate from Server
    socket.on(SOCKET_EVENTS.GAME.UPDATE, (data) => {
      this.set({
        gamestate: data,
      });
    });
    // -- client
    socket.on(SOCKET_EVENTS.CLIENT.UPDATE, (data) => {
      this.set(data);
    });

    // -- connection stuff
    socket.on('connect', () => {
      this.set({
        isConnected: true,
        isReconnecting: false,
      });
    });

    socket.on('disconnect', () => {
      this.set({
        isConnected: false,
        isReconnecting: false,
      });
    });

    socket.on('reconnect_failed', () => {
      this.set({
        isConnected: false,
        isReconnecting: false,
      });
    });
  }
}
/**
 * Remote App State Singleton
 *
 * @type {RemoteStateModel}
 */
const remoteAppState = new RemoteStateModel();
export default remoteAppState;
