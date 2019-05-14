import Point from '@studiomoniker/point';

import {SOCKET_EVENTS} from 'constants.shared/socketEvents';

import Model from 'models/Model';

import logger from 'utilities/logger.remote';

const createDate = new Date();

// TESTING
const _name = (() => {
  const firsts = ['amazing', 'cool', 'ticklish', 'rainbow', 'cheerful', 'sleepy', 'poopy', 'rectangular', 'transparent', 'plaid', 'laughing'];
  const seconds = ['diamond', 'jello', 'treater', 'tricker', 'pumpkin', 'ghost', 'vampire', 'muppet', 'tattler', 'cowboy', 'pokemon', 'triangle'];

  const randomChoice = (list) => (list[Math.floor(Math.random()*list.length)]);

  return `${randomChoice(firsts)}-${randomChoice(seconds)}`;
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
      _userId: `${_name}-${createDate.getTime()}`,
      userId: 'TEST_REMOTE_USER',

      // -- my client state - from the server
      /** @type {Boolean} */
      isInLobby: false,
      /** @type {Boolean} */
      isInGame: false,
      /** @type {Boolean} */
      isGameInProgress: false,
      /** @type {Array<String>} */
      lobbyData: [],

      // -- my player's specific gamestate stuff
      /** @type {Object | undefined} */
      myCharacter: undefined,
      /** @type {Object | undefined} */
      myUser: undefined,

      // -- websocket connection status
      /** @type {Boolean} */
      isConnected: false,
      /** @type {Boolean} */
      isReconnecting: false,

      // -- dev stuff
      /** @type {Boolean} */
      isDevMode: true,
      /** @type {Boolean} */
      isEditorMode: false,
      /** @type {Boolean} */
      isDebugMenuActive: false,
      /** @type {Array} */
      appLog: [],
      //
      ...newAttributes,
    });
  }
  /**
   * attach listeners to the websocket
   */
  attachSocketListeners(socket) {
    socket.on(SOCKET_EVENTS.UPDATE.CLIENT, (data) => {
      // convert positional Coordinates into points
      // @todo - fix this ugly
      const myCharacterData = data.myCharacter ? {
        ...data.myCharacter,
        position: new Point(data.myCharacter.position.x, data.myCharacter.position.y),
      } : {};

      this.set({
        ...data,
        myCharacter: myCharacterData,
      });

      logger.server('SOCKET_EVENTS.UPDATE.CLIENT');
    });

    // update just for character
    socket.on(SOCKET_EVENTS.UPDATE.MY_CHARACTER, (characterAttributes) => {
      const formattedCharacterData = {
        ...characterAttributes,
        position: new Point(characterAttributes.position.x, characterAttributes.position.y),
      };

      this.set({
        myCharacter: formattedCharacterData,
      });

      logger.server('SOCKET_EVENTS.UPDATE.MY_CHARACTER');
    });

    // -- connection stuff
    socket.on('connect', () => {
      this.set({
        isConnected: true,
        isReconnecting: false,
      });

      logger.server('connected to server');
    });

    socket.on('disconnect', () => {
      this.set({
        isConnected: false,
        isReconnecting: false,
      });

      logger.server('disconnected to server');
    });

    socket.on('reconnect_failed', () => {
      this.set({
        isConnected: false,
        isReconnecting: false,
      });
    });
  }
}
// prepare default state based on current path
const currentPath = window.location.pathname;
const isPathEditorMode = currentPath === '/encounter_editor' || currentPath === '/tile_editor';
/**
 * Remote App State Singleton
 *
 * @type {RemoteStateModel}
 */
const remoteAppState = new RemoteStateModel({
  isInLobby: currentPath === '/lobby',
  isInGame: currentPath === '/game',
  isEditorMode: isPathEditorMode,
});
export default remoteAppState;
