import {
  observable,
  reaction,
  toJS,
} from 'mobx';

import {CLIENT_TYPES} from 'constants/clientTypes';

import GamestateModel from 'models/GamestateModel';

/**
 * This should hold the state of the Server
 */
const clients = observable.array();
const appStore = observable({
  // -- app session data
  /** @type {Date} */
  createDate: Date.now(),
  /** @type {Date} */
  lastUpdateDate: Date.now(),

  /** @type {GamestateModel} */
  gamestate: null,

  // -- client data
  /** @type {Array<SocketClientModel>} */
  clients: clients,
  /** @type {ScreenClientModel} */
  screenClient: undefined,

  /** @type {Array<RemoteClientModel>} */
  get lobbyClients() {
    return this.clients.filter((client) => (client.get('isInLobby')));
  },
  /** @type {Array<RemoteClientModel>} */
  get gameClients() {
    return this.clients.filter((client) => (client.get('isInGame')));
  },
});
// -- function wrappers for the Store
/**
 * makes changes to the state
 *
 * @param {Object} changes
 */
export function update(changes) {
  for (const i in changes) {
    if (Object.prototype.hasOwnProperty.call(changes, i)) {
      appStore[i] = changes[i];
    }
  }
}
/**
 * wrapper for watching for a change for a specific property
 * @link https://mobx.js.org/refguide/reaction.html
 *
 * @param {String} property - one of the observeable properties in the `appStore`
 * @param {Function} callback
 * @returns {Function} - returns the `disposer` which will remove the observer
 */
export function onChange(property, callback) {
  return reaction(
    () => appStore[property],
    callback,
  );
}
/**
 * this gets the non-observable, non-reactable state of the App
 *
 * @returns {Object}
 */
export function getState() {
  return toJS(appStore);
}
// -- Actions for the Server state
/**
 *
 */
export function startGame() {
  update({
    gamestate: new GamestateModel(),
  });
}
/**
 * @param {SocketClientModel} clientModel
 */
export function addClient(clientModel) {
  const updatedClients = [].concat(appStore.clients);
  updatedClients.push(clientModel);

  // additional steps for the Screen
  if (clientModel.get('clientType') === CLIENT_TYPES.SCREEN) {
    addScreenClient(clientModel);
  }

  update({clients: updatedClients});
}
/**
 * @param {RemoteClientModel} clientModel
 */
export function addScreenClient(clientModel) {
  if (appStore.screenClient !== null) {
    console.warn('! - a Screen Client already exists - it is getting replaced');
  }

  update({screenClient: clientModel});
}
/**
 * @param {SocketClient} clientModel
 */
export function removeClient(clientModel) {
  const filterUser = (user) => (user.get('userId') !== clientModel.get('userId'));
  const updatedClients = appStore.clients.filter(filterUser);

  update({
    clients: updatedClients,
  });

  // if the removed Client was a Screen, we have more to do
  if (clientModel.get('clientType') === CLIENT_TYPES.SCREEN) {
    removeScreenClient();
  }
}
/**
 * @param {RemoteClientModel} clientModel
 */
export function removeScreenClient(clientModel) {
  console.log(`Screen Client ${clientModel.get('name')} removed`);
  update({screenClient: null});
}
