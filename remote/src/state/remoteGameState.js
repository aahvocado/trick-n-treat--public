import Point from '@studiomoniker/point';

import { SOCKET_EVENTS } from 'constants.shared/socketEvents';

import Model from 'models/Model';

import logger from 'utilities/logger.remote';
import * as matrixUtils from 'utilities.shared/matrixUtils';

/**
 *
 */
export class RemoteGamestateModel extends Model {
  /** @override */
  constructor(newAttributes = {}) {
    super({
      // -- gamestate - from the server
      /** @type {GamestateObject | undefined} */
      gamestate: undefined,

      /** @type {EncounterData| null} */
      activeEncounter: null,

      // -- tile map options
      /** @type {Boolean} */
      useFullyVisibleMap: false,
      /** @type {Boolean} */
      useZoomedOutMap: false,
    });
  }
  /**
   * attach listeners to the websocket
   */
  attachSocketListeners(socket) {
    // received new Gamestate from Server
    socket.on(SOCKET_EVENTS.UPDATE.GAME, (data) => {
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

      logger.server('SOCKET_EVENTS.UPDATE.GAME');
    });

    socket.on(SOCKET_EVENTS.GAME.ENCOUNTER, (data) => {
      this.set({
        activeEncounter: data,
      });
    });
  }
}
/**
 * Remote Game State Singleton
 *
 * @type {RemoteGamestateModel}
 */
const remoteGameState = new RemoteGamestateModel();
export default remoteGameState;
