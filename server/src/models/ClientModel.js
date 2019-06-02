import Point from '@studiomoniker/point';

import {CLIENT_TYPE} from 'constants.shared/clientTypes';
import {SOCKET_EVENT} from 'constants.shared/socketEvents';

import ItemModel from 'models.shared/ItemModel';
import Model from 'models.shared/Model';

import * as gamestateUserHelper from 'helpers/gamestateUserHelper';

import serverState from 'state/serverState';

import * as gamestateCharacterHelper from 'helpers/gamestateCharacterHelper';

import convertObservableToJs from 'utilities.shared/convertObservableToJs';

/**
 * class for a Websocket Client
 *
 * @typedef {Model} ClientModel
 */
export default class ClientModel extends Model {
  /** @override */
  constructor(newAttributes = {}) {
    super({
      // -- Client attributes
      /** @type {String} */
      name: '',
      /** @type {String} */
      clientId: undefined,
      /** @type {String} */
      clientType: CLIENT_TYPE.REMOTE,
      /** @type {Socket.IO-Client} */
      socket: undefined,
      /** @type {String} */
      sessionId: '',

      // -- State attributes
      /** @type {Boolean} */
      isInGame: false,
      /** @type {Boolean} */
      isInLobby: false,

      // -- Game attributes
      /** @type {CharacterModel | null} */
      characterModel: null,
      /** @type {Object} */
      ...newAttributes,
    });

    // `addListeners()` when a Client and Character is finally set on this user
    this.onChange('characterModel', (characterModel) => {
      if (characterModel !== null && characterModel !== undefined) {
        this.attachGameListeners();
      }
    });

    // add Websocket event listeners
    this.attachServerListeners();
  }
  /**
   * @param {...*} args
   */
  emit(...args) {
    this.get('socket').emit(...args);
  }
  /**
   * attaches listeners related to updating information
   *  before the Client is actually in the game
   */
  attachServerListeners() {
    const socket = this.get('socket');

    // client wants to "Game Start"
    socket.on(SOCKET_EVENT.LOBBY.TO_SERVER.START, () => {
      serverState.handleStartGame();
    });

    // client wants to "Join" game in session
    socket.on(SOCKET_EVENT.LOBBY.TO_SERVER.JOIN, () => {
      gamestateUserHelper.handleJoinGame(this);
    });

    // -- debug events
    // client wants to restart the game
    socket.on(SOCKET_EVENT.DEBUG.TO_SERVER.RESTART_GAME, () => {
      serverState.handleRestartGame();
    });
  }
  /**
   * attaches listeners related to the Character
   */
  attachGameListeners() {
    const socket = this.get('socket');

    // client clicked to move to a Coordinate
    socket.on(SOCKET_EVENT.GAME.TO_SERVER.MOVE_TO, this.onMoveTo.bind(this));

    // client clicked an Action from the Encounter modal
    socket.on(SOCKET_EVENT.GAME.TO_SERVER.CHOSE_ACTION, this.onChooseAction.bind(this));

    // client used an Item
    socket.on(SOCKET_EVENT.GAME.TO_SERVER.USE_ITEM, this.onUseItem.bind(this));
  }
  // -- Game Listener methods
  /**
   * @param {Object} coordinates
   */
  onMoveTo(coordinates) {
    const position = new Point(coordinates.x, coordinates.y);
    gamestateCharacterHelper.moveCharacterTo(this.get('characterModel'), position);
  }
  /**
   * @param {EncounterId} encounterId
   * @param {ActionData} actionData
   */
  onChooseAction(encounterId, actionData) {
    gamestateCharacterHelper.handleCharacterChoseAction(this.get('characterModel'), encounterId, actionData);
  }
  /**
   * @param {ItemData} itemData
   */
  onUseItem(itemData) {
    const itemModel = new ItemModel(itemData);
    gamestateCharacterHelper.handleCharacterUseItem(this.get('characterModel'), itemModel);
  }
  /**
   * @override
   */
  export() {
    const convertedData = convertObservableToJs(this.attributes);
    return {
      name: convertedData.name,
      clientType: convertedData.clientType,
      isInGame: convertedData.isInGame,
      isInLobby: convertedData.isInLobby,
    };
  }
}
