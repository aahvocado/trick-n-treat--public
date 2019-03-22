import {extendObservable} from 'mobx';

import {CLIENT_TYPES} from 'constants/clientTypes';
import {SERVER_MODES} from 'constants/gameModes';

import Model from 'models/Model';

/**
 *
 */
export class ServerStateModel extends Model {
  /** @override */
  constructor(newAttributes = {}) {
    super({
      /** @type {ServerMode} */
      mode: SERVER_MODES.LOBBY,

      // -- client data
      /** @type {Array<SocketClientModel>} */
      clients: [],
      /** @type {ScreenClientModel} */
      screenClient: null,

      // -- app session data
      /** @type {Date} */
      createDate: undefined,
      /** @type {Date} */
      lastUpdateDate: undefined,
    });

    // computed attributes - (have to pass in this model as context because getters have their own context)
    const stateModel = this;
    extendObservable(this.attributes, {
      /** @type {Array<RemoteClientModel>} */
      get lobbyClients() {
        return stateModel.get('clients').filter((client) => (client.get('isInLobby')));
      },
      /** @type {Array<RemoteClientModel>} */
      get gameClients() {
        return stateModel.get('clients').filter((client) => (client.get('isInGame')));
      },
    });
  }
  // -- Actions for the Server state
  /**
   * Its time to Start the Game!
   *  First, let's make sure the conditions are actually correct.
   *  Then we need to generate a world.
   *  then we can switch modes and start.
   */
  handleStartGame() {
    console.log('\x1b[93m', 'Attempting to Start a Game...');
    if (!this.canStartGame()) {
      return;
    }

    // move everyone from the Lobby to the Game
    const clientsCopy = this.get('clients').slice();
    clientsCopy.map((client) => {
      client.set({
        isInLobby: false,
        isInGame: true,
      });
    });

    this.set({
      clients: this.get('clients').replace(clientsCopy),
      mode: SERVER_MODES.GAME,
    });
  }
  /**
   * check if everything is valid to create a game
   *
   * @returns {Boolean}
   */
  canStartGame() {
    if (this.get('mode') === SERVER_MODES.GAME) {
      console.error('\x1b[91m', '. There is already a game in progress!');
      return false;
    }

    if (this.get('clients').length <= 0) {
      console.error('\x1b[91m', '. There is no one here!');
      return false;
    }

    if (this.get('lobbyClients').length <= 0) {
      console.error('\x1b[91m', '. There are no players!');
      return false;
    }

    if (this.get('screenClient') === null) {
      console.error('\x1b[91m', '. There is no Screen!');
      // return false;
    }

    return true;
  }
  /**
   * @param {SocketClientModel} clientModel
   */
  addClient(clientModel) {
    const updatedClients = this.get('clients').slice();
    updatedClients.push(clientModel);

    // additional steps for the Screen
    if (clientModel.get('clientType') === CLIENT_TYPES.SCREEN) {
      this.addScreenClient(clientModel);
    }

    this.set({clients: updatedClients});
  }
  /**
   * @param {RemoteClientModel} clientModel
   */
  addScreenClient(clientModel) {
    this.set({screenClient: clientModel});
  }
  /**
   * @param {SocketClient} clientModel
   */
  removeClient(clientModel) {
    const filterUser = (user) => (user.get('userId') !== clientModel.get('userId'));
    const updatedClients = this.get('clients').filter(filterUser);

    this.set({
      clients: updatedClients,
    });
  }
}
/**
 * Server App State Singleton
 *
 * @type {ServerStateModel}
 */
const serverState = new ServerStateModel({
  createDate: Date.now(),
  lastUpdateDate: Date.now(),
});
export default serverState;

