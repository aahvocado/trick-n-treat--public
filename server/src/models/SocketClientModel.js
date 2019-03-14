import schema from 'js-schema';

import Model from 'models/Model';

import * as gamestateManager from 'managers/gamestateManager';


// define attribute types
const socketClientSchema = schema({
  // represents the user and should be constant
  userId: String,
  // the websocket connection
  socket: undefined,
  // socket.id - will probably change per session
  sessionId: String,
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
      ...newAttributes,
    });

    this.sendGamestate = this.sendGamestate.bind(this);

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

    // disconnecting
    socket.on('disconnecting', this.onDisconnecting.bind(this));

    // -- attach Gamestate listeners
    // when Gamestate says that it finished actions, send the new state to the User
    gamestateManager.gamestateEmitter.on('UPDATES_COMPLETE', this.sendGamestate);
    // remove the listeners on disconnect
    socket.on('disconnect', () => {
      gamestateManager.gamestateEmitter.removeListener('UPDATES_COMPLETE', this.sendGamestate);
    });

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
   * emits the Gamestate object
   */
  sendGamestate() {
    this.get('socket').emit('GAMESTATE_UPDATE', gamestateManager.getGamestate());
  }
}
/**
 * Client which is a Remote
 *
 * @typedef {Model} RemoteSocketClient
 */
export class RemoteSocketClient extends SocketClientModel {
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
      gamestateManager.updateCharacterPosition(userId, actionId);
    };
  }
  /** @override */
  onDisconnecting() {
    gamestateManager.removeUserData(this.get('userId'));

    console.log(`- Remote Client "${this.get('userId')}" disconnected`);
  }
}
/**
 * Client which is a Screen
 *
 * @typedef {Model} ScreenSocketClient
 */
export class ScreenSocketClient extends SocketClientModel {
  /** @override */
  attachListeners() {
  }
  /** @override */
  onDisconnecting() {
    console.log(`- Screen Client "${this.get('userId')}" disconnected`);
  }
}
export default SocketClientModel;
