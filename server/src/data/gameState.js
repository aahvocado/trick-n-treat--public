import seedrandom from 'seedrandom';
import {extendObservable} from 'mobx';

import {GAME_MODES} from 'constants.shared/gameModes';
import {FOG_TYPES, isWalkableTile} from 'constants.shared/tileTypes';

import * as clientEventHelper from 'helpers/clientEventHelper';
import * as gamestateActionHelper from 'helpers/gamestateActionHelper';
import * as gamestateUserHelper from 'helpers/gamestateUserHelper';

import Model from 'models.shared/Model';
import MapModel from 'models.shared/MapModel';

import * as fogUtils from 'utilities.shared/fogUtils';
import logger from 'utilities/logger.game';
import * as mapUtils from 'utilities.shared/mapUtils';
import randomizeArray from 'utilities.shared/randomizeArray';

// EXPERIMENTAL - number of actions we've ever created
let actionCount = 0;
// EXPERIMENTAL - ms to wait between each resolving action
const timeBetweenActions = 150;
// seed for generating data
const seed = Date.now();
seedrandom(seed, {global: true});
/**
 * A note on this GamestateModel and the related helper files:
 * Hypothetically, everything in the helpers could be a method in this class
 *  but I'm trying to let this model be very generalized getters
 *  with the helpers doing more complex actions
 */
export class GamestateModel extends Model {
  /** @override */
  constructor(newAttributes = {}) {
    super({
      /** @type {GameMode} */
      mode: GAME_MODES.INACTIVE,

      /** @type {Array<GameAction>} */
      actionQueue: [],
      /** @type {GameAction | null} */
      activeAction: null,

      /** @type {Array<CharacterModel>} */
      turnQueue: [],

      /** @type {EncounterModel | null} */
      activeEncounter: null,
      /** @type {Number} */
      round: 0,

      /** @type {Array<UserModel>} */
      users: [],
      /** @type {Array<CharacterModel>} */
      characters: [],
      /** @type {Array<HouseModel>} */
      houses: [],
      /** @type {Array<EncounterModel>} */
      encounters: [],
      /** @type {MapModel} */
      tileMapModel: MapModel,
      /** @type {MapModel} */
      fogMapModel: MapModel,

      /** @type {Array<MapModel>} */
      biomeList: [],
      //
      ...newAttributes,
    });

    // computed attributes - (have to pass in `this` as context because getters have their own context)
    const self = this;
    extendObservable(this.attributes, {
      /** @type {UserModel | null} */
      get activeUser() {
        return self.getActiveUser();
      },
      /** @type {CharacterModel | null} */
      get activeCharacter() {
        return self.getActiveCharacter();
      },
      /** @type {Number} */
      get remainingMoves() {
        const activeCharacter = self.getActiveCharacter();
        if (activeCharacter === null) {
          return -1;
        }

        return activeCharacter.get('movement');
      },
    });

    // -- react to own state changing
    /**
     * `actionQueue` changes
     * Start resolving the `actionQueue` when the moment there's one added
     */
    this.onChange('actionQueue', (actionQueue) => {
      if (actionQueue.length <= 0 || this.get('activeAction') !== null) {
        return;
      }

      logger.new('[[resolving ActionQueue from the top]]');
      gamestateActionHelper.resolveActionQueue();
    });
    /**
     * `activeCharacter` changes
     */
    this.onChange('activeCharacter', (activeCharacter) => {
      // null `activeCharacter` means no more users in `turnQueue`
      if (activeCharacter === null) {
        return;
      }

      this.addToActionQueue(() => {
        this.handleStartOfTurn();
        gamestateUserHelper.updateActionsForAllUsers();
      });
    });

    logger.lifecycle(`Gamestate instantiated - (Seed "${seed}")`);
  }
  // -- Character methods
  /**
   * @param {CharacterModel} characterModel
   */
  addCharacter(characterModel) {
    this.addToArray('characters', characterModel);
  }
  /**
   * @param {CharacterModel} characterModel
   */
  removeCharacter(characterModel) {
    this.removeFromArray('characters', characterModel);
  }
  /**
   * returns the Character whose is currently acting
   * (null probably means the game hasn't started)
   *
   * @returns {CharacterModel | null}
   */
  getActiveCharacter() {
    const turnQueue = this.get('turnQueue').slice();
    if (turnQueue.length <= 0) {
      return null;
    };

    // activeCharacter is just the first character in the queue
    const activeCharacter = turnQueue[0];
    if (activeCharacter === undefined) {
      return null;
    }

    // found character
    return activeCharacter;
  }
  /**
   * gets list of Character at a given Tile position
   *
   * @param {Point} point
   * @returns {Array<CharacterModel>}
   */
  getCharactersAt(point) {
    return this.get('characters').filter((characterModel) => (point.equals(characterModel.get('position'))));
  }
  /**
   * is given character the active one
   *
   * @param {CharacterModel} characterModel
   * @returns {Boolean}
   */
  isActiveCharacter(characterModel) {
    const activeCharacter = this.getActiveCharacter();
    if (activeCharacter === null) {
      return false;
    }

    return activeCharacter.get('characterId') === characterModel.get('characterId');
  }
  /**
   * @param {String} characterId
   * @returns {CharacterModel | undefined}
   */
  findCharacterById(characterId) {
    return this.get('characters').find((characterModel) => {
      return characterModel.get('characterId') === characterId;
    });
  }
  /**
   * @param {String} userId
   * @returns {CharacterModel | undefined}
   */
  findCharacterByUserId(userId) {
    const userModel = this.findUserById(userId);
    if (userModel === undefined) {
      return undefined;
    }

    const characterId = userModel.get('characterId');
    return this.findCharacterById(characterId);
  }
  // -- User methods
  /**
   * @param {UserModel} userModel
   */
  addUser(userModel) {
    this.addToArray('users', userModel);
  }
  /**
   * @param {UserModel} userModel
   */
  removeUser(userModel) {
    this.removeFromArray('users', userModel);
  }
  /**
   * returns the User whose character's is Active,
   * - null if there is no `activeCharacter`
   * - null if `activeCharacter` is an NPC
   *
   * @returns {UserModel | null}
   */
  getActiveUser() {
    // no character is active, means no user is active
    const activeCharacter = this.get('activeCharacter');
    if (activeCharacter === null) {
      return null;
    }

    // if no matching user, then it belongs to an NPC
    const activeUser = this.findUserByCharacterId(activeCharacter.get('characterId'));
    if (activeUser === undefined) {
      return null;
    }

    // found User
    return activeUser;
  }
  /**
   * gets list of Users at a given Tile position
   *
   * @param {Point} point
   * @returns {Array<UserModel>}
   */
  getUsersAt(point) {
    // our strategy here is to search for Characters at a location,
    //  then find their corresponding User
    const foundCharacters = this.getCharactersAt(point);
    return this.get('users').filter((userModel) => {
      return foundCharacters.find((characterModel) => (userModel.get('characterId') === characterModel.get('characterId')));
    });
  }
  /**
   * is given user the active one
   *
   * @param {UserModel} userModel
   * @returns {Boolean}
   */
  isActiveUser(userModel) {
    const activeUser = this.getActiveUser();
    if (activeUser === null) {
      return false;
    }

    return activeUser.get('characterId') === userModel.get('characterId');
  }
  /**
   * @param {String} userId
   * @returns {UserModel | undefined}
   */
  findUserById(userId) {
    return this.get('users').find((userModel) => {
      return userModel.get('userId') === userId;
    });
  }
  /**
   * @param {String} characterId
   * @returns {CharacterModel | undefined}
   */
  findUserByCharacterId(characterId) {
    const users = this.get('users').slice();
    const foundUser = users.find((user) => (user.get('characterId') === characterId));
    if (foundUser === undefined) {
      return undefined;
    }

    return foundUser;
  }
  // -- Map methods
  /**
   * @param {Point} point
   * @returns {Boolean}
   */
  isWalkableAt(point) {
    const tileMapModel = this.get('tileMapModel');
    const foundTile = tileMapModel.getTileAt(point);
    return isWalkableTile(foundTile);
  }
  // -- Encounter methods
  /**
   * gets the Encounter if there is one at given point
   *
   * @param {Point} point
   * @returns {EncounterModel | undefined}
   */
  findEncounterAt(point) {
    const encounters = this.get('encounters').slice();
    return encounters.find((encounterModel) => {
      const encounterLocation = encounterModel.get('location');
      return point.equals(encounterLocation);
    });
  }
  // -- House methods
  /**
   * gets the House if there is one at given point
   *
   * @param {Point} point
   * @returns {HouseModel | undefined}
   */
  findHouseAt(point) {
    const houses = this.get('houses').slice();
    return houses.find((houseModel) => {
      const houseLocation = houseModel.get('location');
      return point.equals(houseLocation);
    });
  }
  /**
   * gets all Entities at a given position
   * EXPERIMENTAL - this is potentially bad since it's list of mixed types
   *
   * @param {Point} point
   * @returns {Array<Model>}
   */
  getEntitiesAt(point) {
    // singular entities
    const foundHouse = this.findHouseAt(point);
    const foundEncounter = this.findEncounterAt(point);

    // arrays
    const foundCharacters = this.getCharactersAt(point);
    const foundUsers = this.getUsersAt(point);

    // this part puts everything together and removes anything that is undefined/null (falsey)
    return [foundHouse, foundEncounter, ...foundCharacters, ...foundUsers].filter(Boolean);
  }
  // -- Action Queue
  /**
   * EXPERIMENTAL
   * creates an asynchronous Action for the ActionQueue using given function
   *
   * @param {Function} action
   * @returns {Function}
   */
  createActionFunction(action) {
    const actionId = actionCount;
    actionCount += 1;
    logger.verbose(`. [[adding action #${actionId}]]`);

    return () => {
      return new Promise((resolve) => {
        logger.verbose(`. [[resolving action #${actionId}]]`);

        // actually call the function here
        action();

        // pause between actions
        setTimeout(resolve, timeBetweenActions);
      });
    };
  }
  /**
   * EXPERIMENTAL
   *
   * @param {Function} action
   */
  addToActionQueue(action) {
    const actionFunction = this.createActionFunction(action);
    this.addToArray('actionQueue', actionFunction);
  }
  /**
   * EXPERIMENTAL
   * insert an Action onto the front of the Queue
   *
   * @param {Function} action
   * @param {Number} [idx]
   */
  insertIntoActionQueue(action, idx = 0) {
    const actionFunction = this.createActionFunction(action);

    const actionQueue = this.get('actionQueue').slice();
    actionQueue.splice(idx, 0, actionFunction);

    this.set({actionQueue: actionQueue});
  }
  // -- Round / Turn logic
  /**
   * builds a Turn Queue based on stuff
   */
  initTurnQueue() {
    const characters = this.get('characters').slice();
    if (characters.length <= 0) {
      logger.error('Why are we creating a TurnQueue with no Characters?');
      return;
    }

    const newTurnQueue = randomizeArray(characters);
    this.set({turnQueue: newTurnQueue});
  }
  /**
   * handles start of turn
   */
  handleStartOfTurn() {
    logger.lifecycle('(handleStartOfTurn)');

    // if the current active is a User, then we should let them know
    const activeUser = this.get('activeUser');
    if (activeUser !== null) {
      activeUser.set({isUserTurn: true});
    }

    // send update
    this.addToActionQueue(clientEventHelper.sendUpdateToAllClients);

    const activeCharacter = this.get('activeCharacter');
    logger.game(`. Turn for: "${activeCharacter.get('name')}"`);
  }
  /**
   * end of turn
   */
  handleEndOfTurn() {
    logger.lifecycle('(handleEndOfTurn)');

    // remove the previous `activeCharacter`
    const currentTurnQueue = this.get('turnQueue').slice();
    const oldActiveCharacter = currentTurnQueue.shift();

    // set the new turn queue
    this.set({turnQueue: currentTurnQueue});

    // reset the old Character's movement
    oldActiveCharacter.set({movement: oldActiveCharacter.get('baseMovement')});

    // check if its time to end the round
    if (currentTurnQueue.length <= 0) {
      this.addToActionQueue(this.handleEndOfRound.bind(this));
      return;
    }

    // send update to everyone
    this.addToActionQueue(clientEventHelper.sendUpdateToAllClients);
  }
  /**
   * round
   */
  handleStartOfRound() {
    logger.lifecycle('(handleStartOfRound)');

    // increment round
    this.set({round: this.get('round') + 1});

    // create new turn queue
    // this.initTurnQueue();
    this.addToActionQueue(this.initTurnQueue.bind(this));
    logger.game(`Round ${this.get('round')} has started.`);
  }
  /**
   * round
   */
  handleEndOfRound() {
    logger.lifecycle('(handleEndOfRound)');

    this.addToActionQueue(this.handleStartOfRound.bind(this));
  }
  // -- Fog methods
  /**
   * updates Fog of War visibility to Fully visible at a given point
   *
   * @param {Point} point
   * @param {Number} distance
   */
  updateToVisibleAt(point, distance) {
    const fogMapModel = this.get('fogMapModel');
    const tileMapModel = this.get('tileMapModel');

    // given tile is now visible
    fogMapModel.setTileAt(point, FOG_TYPES.VISIBLE);

    // other tiles that are a given distance away should be partially visible, if not already
    const nearbyPoints = mapUtils.getPointsWithinPathDistance(tileMapModel.getMatrix(), point, distance);
    nearbyPoints.forEach((point) => {
      fogUtils.updateFogPointToVisible(fogMapModel, tileMapModel, point);
    });
  }
}
/**
 * Gamestate Singleton
 *
 * @type {GamestateModel}
 */
const gameState = new GamestateModel();
export default gameState;
