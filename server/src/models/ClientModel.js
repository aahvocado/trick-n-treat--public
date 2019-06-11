import {extendObservable} from 'mobx';
import Point from '@studiomoniker/point';

import {CLIENT_TYPE} from 'constants.shared/clientTypes';
import {SOCKET_EVENT} from 'constants.shared/socketEvents';

import ItemModel from 'models.shared/ItemModel';
import Model from 'models.shared/Model';

import gameState from 'state/gameState';
import serverState from 'state/serverState';

import logger from 'utilities/logger.game';

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

      // -- Instance attributes
      /** @type {CharacterModel | null} */
      myCharacter: null,
      /** @type {Object} */
      ...newAttributes,
    });

    // computed attributes
    const _this = this;
    extendObservable(this.attributes, {
      /** @type {CharacterModel | null} */
      get isConnected() {
        return _this.get('socket') !== undefined;
      },
    });

    // `addListeners()` when a Client and Character are finally set on this user
    this.onChange('myCharacter', (myCharacter) => {
      if (myCharacter !== null && myCharacter !== undefined) {
        this.attachGameListeners();
      }
    });

    // add Websocket event listeners
    this.attachServerListeners();
  }
  /** @override */
  export() {
    const convertedData = convertObservableToJs(this.attributes);
    return {
      name: convertedData.name,
      clientType: convertedData.clientType,
      isInGame: convertedData.isInGame,
      isInLobby: convertedData.isInLobby,
    };
  }
  /**
   * attaches listeners related to updating information
   *  before the Client is actually in the game
   */
  attachServerListeners() {
    const socket = this.get('socket');
    logger.new(`+ Client "${this.get('name')}" connected.`);

    // client wants to "Game Start"
    socket.on(SOCKET_EVENT.LOBBY.TO_SERVER.START, () => {
      serverState.handleStartGame();
    });

    // client wants to "Join" game in session
    socket.on(SOCKET_EVENT.LOBBY.TO_SERVER.JOIN, () => {
      gameState.handleClientRejoin(this);
    });

    // -- debug events
    // client wants to restart the game
    socket.on(SOCKET_EVENT.DEBUG.TO_SERVER.RESTART_GAME, () => {
      serverState.handleRestartGame();
    });

    // -- generic events
    /**
     * disconnected, so remove client from the list
     */
    socket.on('disconnect', () => {
      logger.old(`- Client "${this.get('name')}" disconnected.`);

      const clientList = serverState.get('clientList');
      const clientIdx = clientList.findIndex((client) => client.get('sessionId') === socket.id);
      clientList.splice(clientIdx, 1);
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

    // -- console command
    socket.on(SOCKET_EVENT.DEBUG.TO_SERVER.CONSOLE_COMMAND, this.handleConsoleCommand.bind(this));
  }
  // -- Game Listener methods
  /**
   * @param {Object} coordinates
   */
  onMoveTo(coordinates) {
    const position = new Point(coordinates.x, coordinates.y);
    gameState.moveCharacterTo(this.get('myCharacter'), position);
  }
  /**
   * @param {EncounterId} encounterId
   * @param {ActionData} actionData
   */
  onChooseAction(encounterId, actionData) {
    gameState.handleCharacterChoseAction(this.get('myCharacter'), encounterId, actionData);
  }
  /**
   * @param {ItemData} itemData
   */
  onUseItem(itemData) {
    const itemModel = new ItemModel(itemData);
    gameState.handleCharacterUseItem(this.get('myCharacter'), itemModel);
  }
  /**
   * @param {Object} consoleData
   */
  handleConsoleCommand(consoleData) {
    const {action, target, value} = consoleData;
    if (action === 'set') {
      this.get('myCharacter').setStatById(target, value);
      this.emitMyCharacter();
    }
  }
  // -- emit functions
  /** @default */
  emit(...args) {
    this.get('socket').emit(...args);
  }
  /**
   * give encounter to client
   *
   * @param {EncounterModel} encounterModel
   */
  emitEncounter(encounterModel) {
    this.emit(SOCKET_EVENT.GAME.TO_CLIENT.ENCOUNTER, encounterModel.export());
  }
  /**
   * tell client to close the Encounter
   */
  emitEncounterClose() {
    this.emit(SOCKET_EVENT.GAME.TO_CLIENT.CLOSE_ENCOUNTER);
  }
  /**
   * give the client it's own Character data
   */
  emitMyCharacter() {
    const myCharacter = this.get('myCharacter');
    this.emit(SOCKET_EVENT.GAME.TO_CLIENT.MY_CHARACTER, myCharacter.export());
  }
  /**
   * tell the client the game has ended
   */
  emitGameEnd() {
    this.emit(SOCKET_EVENT.GAME.TO_CLIENT.END);
  }
  // -- debugger emits
  /**
   * @param {Array<Matrix>} mapHistory
   */
  emitToMapHistory(mapHistory) {
    this.emit(SOCKET_EVENT.DEBUG.TO_CLIENT.SET_MAP_HISTORY, mapHistory);
  }
  /**
   * @param {Matrix} matrix
   */
  emitToTileEditor(matrix) {
    this.emit(SOCKET_EVENT.DEBUG.TO_CLIENT.SET_TILE_EDITOR, matrix);
  }
  /**
   * send to remote's `appLog`
   * @param {String} logString
   */
  emitToClientLog(logString) {
    this.emit(SOCKET_EVENT.DEBUG.TO_CLIENT.ADD_LOG, logString);
  }
}
