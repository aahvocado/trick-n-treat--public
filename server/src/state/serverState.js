import {extendObservable} from 'mobx';

import {CLIENT_TYPES} from 'constants.shared/clientTypes';
import {GAME_MODES} from 'constants.shared/gameModes';
import {SERVER_MODES} from 'constants.shared/gameModes';

import * as gamestateUserHelper from 'helpers/gamestateUserHelper';

import Model from 'models.shared/Model';

import gameState from 'state/gameState';

import logger from 'utilities/logger.game';

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
      /** @type {SocketClientModel | null} */
      get activeClient() {
        const activeUser = gameState.get('activeUser');
        if (activeUser === null) {
          return null;
        }

        const matchingClient = stateModel.findClientByUser(activeUser);
        return matchingClient;
      },
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
   * all the `findClient` methods use this
   *
   * @param {String} userId
   * @returns {SocketClientModel | undefined}
   */
  findClientByUserId(userId) {
    const clients = this.get('clients');
    return clients.find((clientModel) => (clientModel.get('userId') === userId));
  }
  /**
   * @param {UserModel} userModel
   * @returns {SocketClientModel | undefined}
   */
  findClientByUser(userModel) {
    const userId = userModel.get('userId');
    const clientModel = this.findClientByUserId(userId);
    return clientModel;
  }
  /**
   * @param {String} characterId
   * @returns {SocketClientModel | undefined}
   */
  findClientByCharacterId(characterId) {
    const userModel = gameState.findUserByCharacterId(characterId);
    return this.findClientByUser(userModel);
  }
  /**
   * @param {CharacterModel} characterModel
   * @returns {SocketClientModel | undefined}
   */
  findClientByCharacter(characterModel) {
    const characterId = characterModel.get('characterId');
    return this.findClientByCharacterId(characterId);
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
    gameState.handleStartGame();
  }
  /**
   * Restart the Game
   */
  handleRestartGame() {
    logger.game('Restarting Game!');

    gameState.set({
      users: [],
      characters: [],
    });

    const gameClients = this.get('gameClients');
    gameClients.forEach((clientModel) => {
      gamestateUserHelper.createUserFromClient(clientModel);
    });

    gameState.handleRestartGame();
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
      // return false;
    }

    if (this.get('lobbyClients').length <= 0) {
      logger.error('. There are no players!');
      // return false;
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

