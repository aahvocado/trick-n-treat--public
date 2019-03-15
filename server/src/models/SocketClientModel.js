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
    this.attachListeners();
  }
  /**
   * called after `init()`
   * @abstract
   */
  attachListeners() {}
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
  attachListeners() {}
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
}
export default SocketClientModel;
