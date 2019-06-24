import {NotificationManager} from 'react-notifications';

import {extendObservable} from 'mobx';

import {SOCKET_EVENT} from 'constants.shared/socketEvents';

import Model from 'models/Model'; // todo - use shared

import logger from 'utilities/logger.remote';

import * as mapGenerationUtils from 'utilities.shared/mapGenerationUtils';
const shouldGenerateTestMap = false; // toggle this to use generate a test map in the tileEditor

// TESTING
const createDate = new Date();
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
      _clientId: `${_name}-${createDate.getTime()}`,
      clientId: 'TEST_REMOTE_USER',

      // -- my client state - from the server
      /** @type {Boolean} */
      isInLobby: false,
      /** @type {Boolean} */
      isInGame: false,
      /** @type {Boolean} */
      isGameInProgress: false,
      /** @type {Array<Object>} */
      lobbyData: [],

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
      /** @type {Grid} */
      currentTileGrid: undefined,
      /** @type {Array<Grid>} */
      history: [],
      /** @type {Boolean} */
      isDebugMenuActive: false,
      /** @type {Array} */
      appLog: [],
      //
      ...newAttributes,
    });

    // computed attributes - (have to pass in this model as context because getters have their own context)
    const stateModel = this;
    extendObservable(this.attributes, {
      /** @type {Array<ClientModel>} */
      get lobbyClients() {
        return stateModel.get('lobbyData').filter((client) => (client.isInLobby));
      },
      /** @type {Array<ClientModel>} */
      get gameClients() {
        return stateModel.get('lobbyData').filter((client) => (client.isInGame));
      },
    });

    // testing only - remove later
    if (shouldGenerateTestMap) {
      const testhistory = mapGenerationUtils.generateTestMap();
      this.set({history: testhistory});
    }
  }
  /**
   * attach listeners to the websocket
   */
  attachSocketListeners(socket) {
    // lobby data updated
    socket.on(SOCKET_EVENT.LOBBY.TO_CLIENT.UPDATE, (data) => {
      logger.server('SOCKET_EVENT.LOBBY.TO_CLIENT.UPDATE');

      this.set({
        lobbyData: data.lobbyData,
        isGameInProgress: data.isGameInProgress,
        isInLobby: data.isInLobby,
        isInGame: data.isInGame,
      });
    });

    // server wants us to add something to the `appLog`
    socket.on(SOCKET_EVENT.DEBUG.TO_CLIENT.ADD_LOG, (logString) => {
      logger.server(logString);
    });

    // server gave us a matrix to display in the tileEditor
    socket.on(SOCKET_EVENT.DEBUG.TO_CLIENT.SET_TILE_EDITOR, (matrix) => {
      logger.server('SOCKET_EVENT.DEBUG.TO_CLIENT.SET_TILE_EDITOR');
      this.set({currentTileGrid: matrix});
    });

    // server gave us a map history
    socket.on(SOCKET_EVENT.DEBUG.TO_CLIENT.SET_MAP_HISTORY, (history) => {
      logger.server('SOCKET_EVENT.DEBUG.TO_CLIENT.SET_MAP_HISTORY');
      this.set({history: history});
    });

    // -- connection stuff
    socket.on('connect', () => {
      logger.server('connected to server');
      NotificationManager.success(`Welcome, ${this.get('name')}!`, 'Connected!');

      this.set({
        isConnected: true,
        isReconnecting: false,
      });
    });

    socket.on('disconnect', () => {
      logger.server('disconnected from server');
      NotificationManager.error('Click the indicator dot to reconnect.', 'Disconnected!');

      this.set({
        isConnected: false,
        isReconnecting: false,
        isGameInProgress: false,
        lobbyData: [],
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
