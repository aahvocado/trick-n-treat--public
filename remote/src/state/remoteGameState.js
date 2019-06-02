import Point from '@studiomoniker/point';

import {SOCKET_EVENT} from 'constants.shared/socketEvents';

import Model from 'models/Model';
import CharacterModel from 'models.shared/CharacterModel';
import EncounterModel from 'models.shared/EncounterModel';
import ItemModel from 'models.shared/ItemModel';

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
      myCharacter: new CharacterModel(),

      /** @type {Boolean} */
      showEncounterModal: false,
      /** @type {EncounterModel} */
      activeEncounter: new EncounterModel(),

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

      this.set({
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
      const convertedInventory = data.inventory.map((itemData) => new ItemModel(itemData));
      const formattedCharacterAttributes = {
        ...data,
        position: new Point(data.position.x, data.position.y),
        inventory: convertedInventory,
      };

      const newCharacterModel = new CharacterModel(formattedCharacterAttributes);
      const formattedInventory = convertedInventory.map((itemModel) => {
        itemModel.set({_hasMetConditions: itemModel.canBeUsedBy(newCharacterModel)});
        return itemModel;
      });
      newCharacterModel.set({inventory: formattedInventory});

      this.set({myCharacter: newCharacterModel});
    });

    // Game is giving us an Encounter
    socket.on(SOCKET_EVENT.GAME.TO_CLIENT.ENCOUNTER, (data) => {
      logger.server('SOCKET_EVENT.GAME.TO_CLIENT.ENCOUNTER');

      // do a little bit of organizing before creating Model
      const characterModel = this.get('myCharacter');
      const encounterModel = new EncounterModel(data);

      const formattedActionList = data.actionList.map((actionData) => ({
        ...actionData,
        _hasMetConditions: conditionUtils.doesMeetAllConditions(actionData.conditionList, characterModel, encounterModel),
      }));
      encounterModel.set({actionList: formattedActionList});

      const formattedTriggerList = data.triggerList.map((triggerData) => ({
        ...triggerData,
        _hasMetConditions: conditionUtils.doesMeetAllConditions(triggerData.conditionList, characterModel, encounterModel),
      }));
      encounterModel.set({triggerList: formattedTriggerList});

      this.set({
        activeEncounter: encounterModel,
        showEncounterModal: true,
      });
    });

    // Game is closing (removing) the Encounter
    socket.on(SOCKET_EVENT.GAME.TO_CLIENT.CLOSE_ENCOUNTER, () => {
      logger.server('SOCKET_EVENT.GAME.TO_CLIENT.CLOSE_ENCOUNTER');
      this.set({showEncounterModal: false});
    });

    socket.on(SOCKET_EVENT.GAME.TO_CLIENT.END, () => {
      logger.server('SOCKET_EVENT.GAME.TO_CLIENT.END');

      this.set({
        gamestate: undefined,
        activeEncounter: new EncounterModel(),
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
