import {extendObservable} from 'mobx';

import {CLIENT_TYPE} from 'constants.shared/clientTypes';
import {SERVER_MODE} from 'constants.shared/gameModes';
import {SOCKET_EVENT} from 'constants.shared/socketEvents';

import ClientModel from 'models/ClientModel';

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
      mode: SERVER_MODE.LOBBY,

      // -- client data
      /** @type {ModelList<ClientModel>} */
      clientList: new ModelList([], ClientModel),

      // -- app session data
      /** @type {Date} */
      createDate: undefined,
      /** @type {Date} */
      lastUpdateDate: undefined,
      //
      ...newAttributes,
    });

    // -- computed attributes
    const _this = this;
    extendObservable(this.attributes, {
      /** @type {Boolean} */
      get isGameInProgress() {
        return _this.get('mode') === SERVER_MODE.GAME && gameState.get('isActive');
      },
      /** @type {ClientModel | null} */
      get currentClient() {
        const currentCharacter = gameState.get('currentCharacter');
        if (currentCharacter === null) {
          return null;
        }

        return _this.findClientByCharacter(currentCharacter);
      },
      // -- Client List getters
      /** @type {Array<ClientModel>} */
      get lobbyClients() {
        return _this.get('clientList').filter((client) => (client.get('isInLobby')));
      },
      /** @type {Array<ClientModel>} */
      get gameClients() {
        return _this.get('clientList').filter((client) => (client.get('isInGame')));
      },
      /** @type {Array<ClientModel>} */
      get remoteClients() {
        return _this.get('clientList').filter((client) => (client.get('clientType') === CLIENT_TYPE.REMOTE));
      },
      /** @type {Array<ClientModel>} */
      get screenClients() {
        return _this.get('clientList').filter((client) => (client.get('clientType') === CLIENT_TYPE.SCREEN));
      },
    });
  }
  /**
   * @param {CharacterModel} characterModel
   * @returns {ClientModel | undefined}
   */
  findClientByCharacter(characterModel) {
    const clientList = this.get('clientList');
    return clientList.find((clientModel) => {
      const clientCharacter = clientModel.get('myCharacter');
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
    const clientList = this.get('clientList');
    clientList.forEach((clientModel) => {
      clientModel.set({
        isInLobby: false,
        isInGame: true,
      });
    });

    // change to game mode
    this.set({mode: SERVER_MODE.GAME});

    // update clients
    this.emitLobbyUpdate();

    // initialize the game with the Clients that are in game
    const gameClients = this.get('gameClients');
    gameState.addToFunctionQueue(() => {
      gameState.handleStartGame(gameClients);
    }, 'handleStartGame');
  }
  /**
   * Restart the Game
   */
  handleRestartGame() {
    logger.game('Restarting Game!');

    const gameClients = this.get('gameClients');
    gameState.addToFunctionQueue(() => {
      gameState.handleRestartGame(gameClients);
    }, 'handleRestartGame');
  }
  /**
   * check if everything is valid to create a game
   *
   * @returns {Boolean}
   */
  canStartGame() {
    if (this.get('isGameInProgress')) {
      logger.error('. There is already a game in progress!');
      return false;
    }

    if (this.get('clientList').length <= 0) {
      logger.error('. There is no one here!');
      return false;
    }

    if (this.get('lobbyClients').length <= 0) {
      logger.error('. There are no players!');
      // return false;
    }

    if (this.get('screenClients').length <= 0) {
      logger.error('. There are no Screen clients!');
      // return false;
    }

    return true;
  }
  // -- emit functions
  /**
   * emit lobby data to everyone
   */
  emitLobbyUpdate() {
    logger.server('emitLobbyUpdate()');
    const clientList = this.get('clientList');

    // this will be given to everyone
    const lobbyData = clientList.export();
    const isGameInProgress = this.get('isGameInProgress');

    // send data to all clients
    clientList.forEach((clientModel) => {
      clientModel.emit(SOCKET_EVENT.LOBBY.TO_CLIENT.UPDATE, {
        lobbyData: lobbyData,
        isGameInProgress: isGameInProgress,
        isInLobby: clientModel.get('isInLobby'),
        isInGame: clientModel.get('isInGame'),
      });
    });
  }
  /**
   * emit game data to all clients in game
   */
  emitGameUpdate() {
    logger.server('emitGameUpdate()');
    const gameClients = this.get('gameClients');

    // format the map data as it will be the same for everyone
    const formattedMapData = gameState.getFormattedMapData();

    // send each client some gamestate data along with their own character data
    gameClients.forEach((clientModel) => {
      clientModel.emit(SOCKET_EVENT.GAME.TO_CLIENT.UPDATE, {
        mapData: formattedMapData,
        myCharacter: clientModel.get('myCharacter').export(),
        mode: gameState.get('mode'),
        round: gameState.get('round'),
      });
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

