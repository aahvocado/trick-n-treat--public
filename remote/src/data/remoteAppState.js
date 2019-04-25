import Point from '@studiomoniker/point';

import {SOCKET_EVENTS} from 'constants/socketEvents';

import Model from 'models/Model';

import logger from 'utilities/logger.remote';
import * as matrixUtils from 'utilities/matrixUtils.remote';

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

      // -- gamestate - from the server
      /** @type {GamestateObject | undefined} */
      gamestate: undefined,
      /** @type {Object | undefined} */
      myCharacter: undefined,
      /** @type {Object | undefined} */
      myUser: undefined,
      /** @type {EncounterData| null} */
      activeEncounter: null,

      // -- tile map options
      /** @type {Boolean} */
      useFullyVisibleMap: false,
      /** @type {Boolean} */
      useZoomedOutMap: false,

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

      // -- dev stuff
      /** @type {Boolean} */
      isDevMode: true,
      /** @type {Boolean} */
      isTileEditorMode: false,
      /** @type {Boolean} */
      isDebugMenuActive: false,
      /** @type {Array} */
      appLog: [],
    });
  }
  /**
   * attach listeners to the websocket
   */
  attachSocketListeners(socket) {
    // received new Gamestate from Server
    socket.on(SOCKET_EVENTS.GAME.UPDATE, (data) => {
      // convert positional Coordinates into points
      // @todo - fix this ugly
      this.set({
        gamestate: {
          ...data,
          mapData: matrixUtils.map(data.mapData, ((tileData) => ({
            ...tileData,
            position: new Point(tileData.position.x, tileData.position.y),
          }))),
        },
      });

      logger.server('received GAME.UPDATE');
    });
    socket.on(SOCKET_EVENTS.GAME.ENCOUNTER_TRIGGER, (data) => {
      this.set({
        activeEncounter: data,
      });
    });
    // -- client
    socket.on(SOCKET_EVENTS.CLIENT.UPDATE, (data) => {
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

      logger.server('received CLIENT.UPDATE');
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
/**
 * Remote App State Singleton
 *
 * @type {RemoteStateModel}
 */
const remoteAppState = new RemoteStateModel();
export default remoteAppState;
