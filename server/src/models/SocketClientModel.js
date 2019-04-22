import {CLIENT_TYPES} from 'constants/clientTypes';

import Model from 'models/Model';

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
