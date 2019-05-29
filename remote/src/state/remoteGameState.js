import Point from '@studiomoniker/point';

import {SOCKET_EVENT} from 'constants.shared/socketEvents';

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
      /** @type {Object | undefined} */
      myCharacter: undefined,

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
    socket.on(SOCKET_EVENT.GAME.TO_CLIENT.UPDATE, (data) => {
      logger.server('SOCKET_EVENT.GAME.TO_CLIENT.UPDATE');

      const {
        myCharacter,
      } = data;

      // convert positional Coordinates into points
      // @todo - fix this ugly
      const myCharacterData = myCharacter ? {
        ...myCharacter,
        position: new Point(myCharacter.position.x, myCharacter.position.y),
      } : {};

      this.set({
        myCharacter: myCharacterData,
        gamestate: {
          mode: data.mode,
          round: data.round,

          mapData: matrixUtils.map(data.mapData, ((tileData) => ({
            ...tileData,
            position: new Point(tileData.position.x, tileData.position.y),
          }))),
        },
      });
    });

    // update just for character
    socket.on(SOCKET_EVENT.GAME.TO_CLIENT.MY_CHARACTER, (characterAttributes) => {
      logger.server('SOCKET_EVENT.GAME.TO_CLIENT.MY_CHARACTER');

      const formattedCharacterData = {
        ...characterAttributes,
        position: new Point(characterAttributes.position.x, characterAttributes.position.y),
      };

      this.set({
        myCharacter: formattedCharacterData,
      });
    });

    socket.on(SOCKET_EVENT.GAME.TO_CLIENT.ENCOUNTER, (data) => {
      logger.server('SOCKET_EVENT.GAME.TO_CLIENT.ENCOUNTER');

      this.set({
        activeEncounter: data,
      });
    });

    socket.on(SOCKET_EVENT.GAME.TO_CLIENT.END, () => {
      logger.server('SOCKET_EVENT.GAME.TO_CLIENT.END');

      this.set({
        gamestate: undefined,
        activeEncounter: null,
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
