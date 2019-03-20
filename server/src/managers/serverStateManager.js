import {
  observable,
  reaction,
  toJS,
} from 'mobx';

import {CLIENT_TYPES} from 'constants/clientTypes';
import {SERVER_MODES} from 'constants/gameModes';

/**
 * state of the Server
 */
const clients = observable.array();
const appStore = observable({
  /** @type {ServerMode} */
  mode: SERVER_MODES.LOBBY,

  // -- client data
  /** @type {Array<SocketClientModel>} */
  clients: clients,
  /** @type {ScreenClientModel} */
  screenClient: null,
  /** @type {Array<RemoteClientModel>} */
  get lobbyClients() {
    return this.clients.filter((client) => (client.get('isInLobby')));
  },
  /** @type {Array<RemoteClientModel>} */
  get gameClients() {
    return this.clients.filter((client) => (client.get('isInGame')));
  },

  // -- app session data
  /** @type {Date} */
  createDate: Date.now(),
  /** @type {Date} */
  lastUpdateDate: Date.now(),
});
// -- Actions for the Server state
/**
 * Its time to Start the Game!
 *  First, let's make sure the conditions are actually correct.
 *  Then we need to generate a world.
 *  then we can switch modes and start.
 */
export function handleStartGame() {
  console.log('\x1b[93m', 'Attempting to Start a Game...');
  const canStart = canStartGame();
  if (!canStart) {
    return;
  }

  // move everyone from the Lobby to the Game
  const clientsCopy = appStore.clients.slice();
  clientsCopy.map((client) => {
    client.set({
      isInLobby: false,
      isInGame: true,
    });
  });

  update({
    clients: appStore.clients.replace(clientsCopy),
    mode: SERVER_MODES.GAME,
  });
}
/**
 * check if everything is valid to create a game
 *
 * @returns {Boolean}
 */
function canStartGame() {
  if (appStore.mode === SERVER_MODES.GAME) {
    console.error('\x1b[91m', '. There is already a game in progress!');
    return false;
  }

  if (appStore.clients.length <= 0) {
    console.error('\x1b[91m', '. There is no one here!');
    return false;
  }

  if (appStore.lobbyClients.length <= 0) {
    console.error('\x1b[91m', '. There are no players!');
    return false;
  }

  if (appStore.screenClient === null) {
    console.error('\x1b[91m', '. There is no Screen!');
    // return false;
  }

  return true;
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
    console.warn('\x1b[91m', 'Another Screen Client connected - the old one is being removed');
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
  update({screenClient: null});
}
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
