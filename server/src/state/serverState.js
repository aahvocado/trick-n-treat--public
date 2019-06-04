import {extendObservable} from 'mobx';

import {CLIENT_TYPE} from 'constants.shared/clientTypes';
import {SERVER_MODES} from 'constants.shared/gameModes';

import * as clientEventHelper from 'helpers/clientEventHelper';

import Model from 'models.shared/Model';
import ModelList from 'models.shared/ModelList';

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
      /** @type {ModelList<ClientModel>} */
      clients: new ModelList(),
      /** @type {ClientModel} */
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
      /** @type {ClientModel | null} */
      get activeClient() {
        const activeUser = gameState.get('activeUser');
        if (activeUser === null) {
          return null;
        }

        const matchingClient = stateModel.findClientByUser(activeUser);
        return matchingClient;
      },
      /** @type {Array<ClientModel>} */
      get lobbyClients() {
        return stateModel.get('clients').filter((client) => (client.get('isInLobby')));
      },
      /** @type {Array<ClientModel>} */
      get gameClients() {
        return stateModel.get('clients').filter((client) => (client.get('isInGame')));
      },
    });
  }
  // --
  /**
   * @param {String} clientId
   * @returns {ClientModel | undefined}
   */
  findClientByClientId(clientId) {
    const clients = this.get('clients');
    return clients.find((clientModel) => (clientModel.get('clientId') === clientId));
  }
  /**
   * @param {CharacterModel} characterModel
   * @returns {ClientModel | undefined}
   */
  findClientByCharacter(characterModel) {
    const clients = this.get('clients');
    return clients.find((clientModel) => {
      const clientCharacter = clientModel.get('characterModel');
      if (clientCharacter === null) {
        return false;
      }

      return clientCharacter.id === characterModel.id;
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
    });

    this.set({
      clients: this.get('clients').replace(clientList),
      mode: SERVER_MODES.GAME,
    });

    // update
    clientEventHelper.sendLobbyUpdate();

    // initialize the game with the Clients that are in game
    const gameClients = this.get('gameClients');
    gameState.addToActionQueue(() => {
      gameState.handleStartGame(gameClients);
    });
  }
  /**
   * Restart the Game
   */
  handleRestartGame() {
    logger.game('Restarting Game!');

    const gameClients = this.get('gameClients');
    gameState.addToActionQueue(() => {
      gameState.handleRestartGame(gameClients);
    });
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
   * @param {ClientModel} clientModel
   */
  addClient(clientModel) {
    const updatedClients = this.get('clients').slice();
    updatedClients.push(clientModel);

    // additional steps for the Screen
    if (clientModel.get('clientType') === CLIENT_TYPE.SCREEN) {
      this.set({screenClient: clientModel});
    }

    this.set({clients: updatedClients});
  }
  /**
   * @param {SocketClient} clientModel
   */
  removeClient(clientModel) {
    const filterClientFunction = (model) => (model.get('clientId') !== clientModel.get('clientId'));
    const updatedClients = this.get('clients').filter(filterClientFunction);

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

