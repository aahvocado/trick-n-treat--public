import {extendObservable} from 'mobx';

import {CLIENT_TYPES} from 'constants/clientTypes';
import {SERVER_MODES} from 'constants/gameModes';

import * as gamestateMapHelper from 'helpers/gamestateMapHelper';
import * as gamestateUserHelper from 'helpers/gamestateUserHelper';

import Model from 'models/Model';

import logger from 'utilities/logger';

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
      //
      ...newAttributes,
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
  // --
  /**
   * @param {String} userId
   * @returns {SocketClientModel | undefined}
   */
  findClientByUserId(userId) {
    const clients = this.get('clients');
    return clients.find((clientModel) => (clientModel.get('userId') === userId));
  }
  // -- Actions for the Server state
  /**
   * Its time to Start the Game!
   *  First, let's make sure the conditions are actually correct.
   *  Then we need to generate a world.
   *  then we can switch modes and start.
   */
  handleStartGame() {
    logger.game('Attempting to Start a Game...');
    if (!this.canStartGame()) {
      return;
    }

    // move everyone from the Lobby to the Game
    const clientList = this.get('clients').slice();
    clientList.forEach((clientModel) => {
      clientModel.set({
        isInLobby: false,
        isInGame: true,
      });

      gamestateUserHelper.createUserFromClient(clientModel);
    });

    this.set({
      clients: this.get('clients').replace(clientList),
      mode: SERVER_MODES.GAME,
    });

    // initialize the game
    gamestateMapHelper.generateNewMap();
  }
  /**
   * check if everything is valid to create a game
   *
   * @returns {Boolean}
   */
  canStartGame() {
    if (this.get('mode') === SERVER_MODES.GAME) {
      logger.error('. There is already a game in progress!');
      return false;
    }

    if (this.get('clients').length <= 0) {
      logger.error('. There is no one here!');
      return false;
    }

    if (this.get('lobbyClients').length <= 0) {
      logger.error('. There are no players!');
      return false;
    }

    if (this.get('screenClient') === null) {
      logger.error('. There is no Screen!');
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

