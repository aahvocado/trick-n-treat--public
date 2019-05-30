import Point from '@studiomoniker/point';

import {SOCKET_EVENT} from 'constants.shared/socketEvents';

import Model from 'models/Model';
import CharacterModel from 'models.shared/CharacterModel';
import EncounterModel from 'models.shared/EncounterModel';

import logger from 'utilities/logger.remote';
import * as conditionUtils from 'utilities.shared/conditionUtils';
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

      /** @type {EncounterModel | null} */
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
    socket.on(SOCKET_EVENT.GAME.TO_CLIENT.MY_CHARACTER, (data) => {
      logger.server('SOCKET_EVENT.GAME.TO_CLIENT.MY_CHARACTER');

      // do a little bit of organizing before creating Model
      const characterModel = this.get('myCharacter');
      const formattedCharacterAttributes = {
        ...data,
        position: new Point(data.position.x, data.position.y),
        inventory: data.inventory.map((itemData) => ({
          ...itemData,
          _doesMeetConditions: conditionUtils.doesMeetAllConditions(characterModel, itemData.conditionList)
        }))
      };

      this.set({myCharacter: new CharacterModel(formattedCharacterAttributes)});
    });

    // Game is giving us an Encounter
    socket.on(SOCKET_EVENT.GAME.TO_CLIENT.ENCOUNTER, (data) => {
      logger.server('SOCKET_EVENT.GAME.TO_CLIENT.ENCOUNTER');

      // do a little bit of organizing before creating Model
      const characterModel = this.get('myCharacter');
      const formmatedEncounterAttributes = {
        ...data,
        actionList: data.actionList.map((actionData) => ({
          ...actionData,
          _doesMeetConditions: conditionUtils.doesMeetAllConditions(characterModel, actionData.conditionList)
        }))
      }

      this.set({activeEncounter: new EncounterModel(formmatedEncounterAttributes)});
    });

    // Game is closing (removing) the Encounter
    socket.on(SOCKET_EVENT.GAME.TO_CLIENT.CLOSE_ENCOUNTER, () => {
      logger.server('SOCKET_EVENT.GAME.TO_CLIENT.CLOSE_ENCOUNTER');
      this.set({activeEncounter: null});
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
