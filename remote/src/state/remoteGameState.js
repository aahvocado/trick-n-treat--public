import {NotificationManager} from 'react-notifications';

import array2d from 'array2d';
import Point from '@studiomoniker/point';

import {extendObservable} from 'mobx';

import {GAME_MODE} from 'constants.shared/gameModes';
import {SOCKET_EVENT} from 'constants.shared/socketEvents';

import Model from 'models/Model';
import CharacterModel from 'models.shared/CharacterModel';
import CellModel from 'models.shared/CellModel';
import GridModel from 'models.shared/GridModel';
import EncounterModel from 'models.shared/EncounterModel';

import logger from 'utilities/logger.remote';
import * as conditionUtils from 'utilities.shared/conditionUtils';

/**
 *
 */
export class RemoteGamestateModel extends Model {
  /** @override */
  constructor(newAttributes = {}) {
    super({
      // -- gamestate - from the server
      /** @type {GameMode} */
      mode: GAME_MODE.INACTIVE,
      /** @type {Number} */
      round: 0,
      /** @type {GridModel | undefined} */
      mapGridModel: undefined,
      /** @type {CharacterModel} */
      myCharacter: new CharacterModel(),

      /** @type {Boolean} */
      isGameComplete: false,

      /** @type {Boolean} */
      showEncounterModal: false,
      /** @type {EncounterModel} */
      activeEncounter: new EncounterModel(),
    });

    // computed attributes - (have to pass in `this` as context because getters have their own context)
    const _this = this;
    extendObservable(this.attributes, {
      /** @type {Boolean} */
      get isActive() {
        return _this.isActive();
      },
      /** @type {Boolean} */
      get isReady() {
        return _this.get('isActive') && !_this.get('isWorking');
      },
      /** @type {Boolean} */
      get isWorking() {
        return _this.get('mode') === GAME_MODE.WORKING;
      },
      /** @type {Boolean} */
      get isMyTurn() {
        const characterModel = _this.get('myCharacter');
        return characterModel.get('isActive');
      },
      /** @type {Point} */
      get myLocation() {
        const characterModel = _this.get('myCharacter');
        return characterModel.get('position');
      },
      /** @type {Array<InventoryData>} */
      get formattedInventoryList() {
        const characterModel = _this.get('myCharacter');
        const inventoryList = characterModel.get('inventoryList');

        return inventoryList.map((itemModel) => {
          const canBeUsed = itemModel.canBeUsedBy(characterModel);
          const itemData = itemModel.export();

          return {
            ...itemData,
            canBeUsed: canBeUsed,
          };
        })
      },
      /** @type {EncounterData} */
      get formattedEncounterData() {
        const characterModel = _this.get('myCharacter');
        const encounterModel = _this.get('activeEncounter');
        const encounterData = encounterModel.export();

        return {
          ...encounterData,
          canBeEncountered: encounterModel.canBeEncounteredBy(characterModel),
          actionList: encounterData.actionList.map((actionData) => ({
            ...actionData,
            canUseAction: conditionUtils.doesMeetAllConditions(actionData.conditionList, characterModel, encounterModel),
          })),
          triggerList: encounterData.triggerList.map((triggerData) => ({
            ...triggerData,
            canBeTriggered: conditionUtils.doesMeetAllConditions(triggerData.conditionList, characterModel, encounterModel),
          })),
        }
      },
    });
  }
  /**
   * attach listeners to the websocket
   */
  attachSocketListeners(socket) {
    // received new Gamestate from Server
    socket.on(SOCKET_EVENT.GAME.TO_CLIENT.UPDATE, (data) => {
      logger.server('SOCKET_EVENT.GAME.TO_CLIENT.UPDATE');

      this.updateMyCharacterData(data.myCharacter);
      const formattedGrid = array2d.map(data.mapData, ((cellData) => new CellModel({
        ...cellData,
        point: new Point(cellData.point.x, cellData.point.y),
      })));

      this.set({
        mode: data.mode,
        round: data.round,
        mapGridModel: new GridModel({
          grid: formattedGrid,
        })
      });
    });

    // update just for character
    socket.on(SOCKET_EVENT.GAME.TO_CLIENT.MY_CHARACTER, (data) => {
      logger.server('SOCKET_EVENT.GAME.TO_CLIENT.MY_CHARACTER');

      this.updateMyCharacterData(data);
    });

    // Game is giving us an Encounter
    socket.on(SOCKET_EVENT.GAME.TO_CLIENT.ENCOUNTER, (data) => {
      logger.server('SOCKET_EVENT.GAME.TO_CLIENT.ENCOUNTER');

      const encounterModel = new EncounterModel();
      encounterModel.import(data);

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

    // Game is Complete
    socket.on(SOCKET_EVENT.GAME.TO_CLIENT.COMPLETE, () => {
      logger.server('SOCKET_EVENT.GAME.TO_CLIENT.COMPLETE');

      this.set({
        mode: GAME_MODE.INACTIVE,
        showEncounterModal: false,
        isGameComplete: true,
      });
    });

    // Game is ending
    socket.on(SOCKET_EVENT.GAME.TO_CLIENT.END, () => {
      logger.server('SOCKET_EVENT.GAME.TO_CLIENT.END');

      this.set({
        mode: GAME_MODE.INACTIVE,
        mapGridModel: undefined,
        myCharacter: new CharacterModel(),
        activeEncounter: new EncounterModel(),
        showEncounterModal: false,
      });
    });

    // clean up after disconnecting
    socket.on('disconnect', () => {
      this.set({
        mode: GAME_MODE.INACTIVE,
        showEncounterModal: false,
      });
    });
  }
  /**
   * @returns {Boolean}
   */
  isActive() {
    const isModeReady = this.get('mode') !== GAME_MODE.INACTIVE;
    const mapGridModel = this.get('mapGridModel');
    const isMapReady = mapGridModel !== undefined && mapGridModel.get('isDefined');
    const isCharacterReady = this.get('myCharacter').get('characterId') !== undefined;

    return isModeReady && isMapReady && isCharacterReady;
  }
  /**
   * @param {Object} data
   */
  updateMyCharacterData(data) {
    if (data === null || data === undefined) {
      return;
    }

    // hold onto if it was previously this character's turn
    const wasMyTurn = this.get('isMyTurn');

    // update the client's Character
    const characterModel = new CharacterModel();
    characterModel.import(data);
    this.set({myCharacter: characterModel});

    // show notification if it was not the Player's turn but now is
    const isMyTurn = this.get('isMyTurn');
    if (!wasMyTurn && isMyTurn) {
      NotificationManager.info('It\'s your turn!');
    };
  }
}
/**
 * Remote Game State Singleton
 *
 * @type {RemoteGamestateModel}
 */
const remoteGameState = new RemoteGamestateModel();
export default remoteGameState;
