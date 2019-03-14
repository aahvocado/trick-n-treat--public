import schema from 'js-schema';

import {CLIENT_TYPES} from 'constants/clientTypes';

import Model from 'models/Model';

// define attribute types
const socketClientSchema = schema({
  // name of Client
  name: String,
  // Remote or Screen?
  clientType: undefined,
  // represents the user and should be constant
  userId: String,
  // the websocket connection
  socket: undefined,
  // socket.id - will probably change per session
  sessionId: String,
  // is the user in Game
  isInGame: Boolean,
  // is the user in Lobby
  isInLobby: Boolean,
});
/**
 * class for a Websocket Client
 *
 * @typedef {Model} SocketClientModel
 */
export class SocketClientModel extends Model {
  /** @override */
  constructor(newAttributes = {}) {
    super({
      isInGame: false,
      isInLobby: false,
      ...newAttributes,
    });

    // onConnection
    this.init();

    // set schema and then validate
    this.schema = socketClientSchema;
    this.validate();
  }
  /**
   * adds Remote specific event listeners
   *  (should be 'connected' by the time this is called)
   *
   * @param {Socket} socket
   */
  init() {
    const socket = this.get('socket');

    // on the way to disconnecting
    socket.on('disconnecting', this.onDisconnecting.bind(this));

    this.attachListeners();
  }
  /**
   * called after `init()`
   * @abstract
   */
  attachListeners() {}
  /**
   * `onDisconnecting` event
   * @abstract
   */
  onDisconnecting() {}
  /**
   * @param {...*} args
   */
  emit(...args) {
    this.get('socket').emit(...args);
  }
}
/**
 * Client which is a Remote
 *
 * @typedef {Model} RemoteClientModel
 */
export class RemoteClientModel extends SocketClientModel {
  /** @override */
  constructor(newAttributes = {}) {
    super({
      clientType: CLIENT_TYPES.REMOTE,
      ...newAttributes,
    });
  }
  /** @override */
  attachListeners() {
    const socket = this.get('socket');

    // User is taking an action
    socket.on('USER_ACTION', this.handleUserAction.bind(this));
  }
  /**
   * interprets an action from a user
   * @param {Object} actionOptions
   * @param {String} actionOptions.userId
   * @param {String} actionOptions.actionId
   */
  handleUserAction({userId, actionId}) {
    // yuck, todo properly
    if (actionId === 'left' || actionId === 'right' || actionId === 'up' || actionId === 'down') {
      // gamestateManager.updateCharacterPosition(userId, actionId);
    };
  }
  /** @override */
  onDisconnecting() {
    console.log(`- Remote Client "${this.get('userId')}" disconnected`);
  }
}
/**
 * Client which is a Screen
 *
 * @typedef {Model} ScreenClientModel
 */
export class ScreenClientModel extends SocketClientModel {
  /** @override */
  constructor(newAttributes = {}) {
    super({
      clientType: CLIENT_TYPES.SCREEN,
      ...newAttributes,
    });
  }
  /** @override */
  attachListeners() {
  }
  /** @override */
  onDisconnecting() {
    console.log(`- Screen Client "${this.get('userId')}" disconnected`);
  }
}
export default SocketClientModel;
