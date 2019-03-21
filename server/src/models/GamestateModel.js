import {extendObservable} from 'mobx';
import {FastCharacter} from 'collections/characterCollection';

import {CLIENT_ACTIONS} from 'constants/clientActions';
import {CLIENT_TYPES} from 'constants/clientTypes';
import {GAME_MODES} from 'constants/gameModes';
import {MAP_START} from 'constants/mapSettings';
import POINTS, {getPointFromString} from 'constants/points';
import TILE_TYPES, {FOG_TYPES, isWalkableTile} from 'constants/tileTypes';

import Model from 'models/Model';
import MapModel from 'models/MapModel';
import UserModel from 'models/UserModel';

// import * as gamestateUtils from 'utilities/gamestateUtils';
import * as mathUtils from 'utilities/mathUtils';
import * as matrixUtils from 'utilities/matrixUtils';

/**
 * character class
 *
 * @typedef {Model} GamestateModel
 */
export class GamestateModel extends Model {
  /** @override */
  constructor(newAttributes = {}) {
    super({
      /** @type {GameMode} */
      mode: GAME_MODES.INACTIVE,

      /** @type {Number} */
      round: 0,
      /** @type {Array<CharacterModel>} */
      turnQueue: [],

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
      //
      ...newAttributes,
    });

    // computed attributes - (have to pass in this model as context because getters have their own context)
    const stateModel = this;
    extendObservable(this.attributes, {
      /** @type {UserModel | null} */
      get activeUser() {
        return stateModel.getActiveUser();
      },
      /** @type {CharacterModel | null} */
      get activeCharacter() {
        return stateModel.getActiveCharacter();
      },
      /** @type {Number} */
      get remainingMoves() {
        const activeCharacter = stateModel.getActiveCharacter();
        if (activeCharacter === null) {
          return -1;
        }

        return activeCharacter.get('movement');
      },
    });

    // -- react to own state changing
    /**
     * `activeCharacter` changes
     */
    this.onChange('activeCharacter', (activeCharacter) => {
      // null `activeCharacter` means no more users in `turnQueue`
      if (activeCharacter === null) {
        return;
      }

      this.handleStartOfTurn();
      this.updateActionsForAllUsers();
    });
    /**
     * `turnQueue` changes
     */
    this.onChange('turnQueue', (turnQueue) => {
      // empty `turnQueue` means end of round
      if (turnQueue.length <= 0) {
        this.handleEndOfRound();
      }
    });
  }
  // -- helper methods
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
   * @returns {UserModel | undefined}
   */
  findUserById(userId) {
    return this.get('users').find((userModel) => {
      return userModel.get('userId') === userId;
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
  /**
   * @param {Point} point
   * @returns {Boolean}
   */
  isWalkableAt(point) {
    const tileMapModel = this.get('tileMapModel');
    const foundTile = tileMapModel.getTileAt(point);
    return isWalkableTile(foundTile);
  }
  /**
   * gets the Encounter if there is one at given point
   *
   * @param {Point} point
   * @returns {EncounterModel | undefined}
   */
  findEncounterAt(point) {
    const encounters = this.get('encounters').slice();
    return encounters.find((encounterModel) => {
      const encounterPosition = encounterModel.get('position');
      return point.equals(encounterPosition);
    });
  }
  /**
   * gets the House if there is one at given point
   *
   * @param {Point} point
   * @returns {HouseModel | undefined}
   */
  findHouseAt(point) {
    const houses = this.get('houses').slice();
    return houses.find((houseModel) => {
      const housePosition = houseModel.get('position');
      return point.equals(housePosition);
    });
  }
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
   * @param {CharacterModel} characterModel
   */
  addCharacter(characterModel) {
    this.addToArray('characters', characterModel);

    // attach onChange listeners to the character - probably can be set up better elsewhere
    characterModel.onChange('position', (position) => {
      this.updateToVisibleAt(position, characterModel.get('vision'));
      this.updateActionsForAllUsers();
    });
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
  // -- Round / Turn logic
  /**
   * builds a Turn Queue based on stuff
   */
  initTurnQueue() {
    const characters = this.get('characters').slice();
    const newTurnQueue = matrixUtils.shuffleArray(characters);
    this.set({turnQueue: newTurnQueue});
  }
  /**
   * handles start of turn
   */
  handleStartOfTurn() {
    console.log('\x1b[36m', '(handleStartOfTurn)');

    // if the current active is a User, then we should let them know
    const activeUser = this.get('activeUser');
    if (activeUser !== null) {
      activeUser.set({isUserTurn: true});
    }

    const activeCharacter = this.get('activeCharacter');
    console.log('\x1b[93m', `. Turn for: "${activeCharacter.get('name')}"`);
  }
  /**
   * end of turn
   */
  handleEndOfTurn() {
    console.log('\x1b[36m', '(handleEndOfTurn)');

    const currentTurnQueue = this.get('turnQueue').slice();

    // remove the previous `activeCharacter`
    const oldActiveCharacter = currentTurnQueue.shift();

    // set the new turn queue
    this.set({turnQueue: currentTurnQueue});

    // reset the old Character's movement
    oldActiveCharacter.set({movement: oldActiveCharacter.get('baseMovement')});
  }
  /**
   * round
   */
  handleStartOfRound() {
    console.log('\x1b[36m', '(handleStartOfRound)');

    // increment round
    this.set({round: this.get('round') + 1});

    // create new turn queue
    this.initTurnQueue();
    console.log('\x1b[93m', `Round ${this.get('round')} has started.`);
  }
  /**
   * round
   */
  handleEndOfRound() {
    console.log('\x1b[36m', '(handleEndOfRound)');

    this.handleStartOfRound();
  }
  // -- fog of war methods
  /**
   * updates Fog of War visibility to Fully visible at a given point
   *
   * @param {Point} point
   * @param {Number} distance
   */
  updateToVisibleAt(point, distance) {
    const fogMapModel = this.get('fogMapModel');

    // given tile is now visible
    fogMapModel.setTileAt(point, FOG_TYPES.VISIBLE);

    // other tiles that are a given distance away should be partially visible, if not already
    const nearbyPoints = matrixUtils.getPointsOfNearbyTiles(fogMapModel.get('matrix'), point, distance);
    nearbyPoints.forEach((point) => {
      this.updateToPartiallyVisibleAt(point);
    });
  }
  /**
   * updates Fog of War visibility to Partially visible at a given point
   *
   * @param {Point} point
   */
  updateToPartiallyVisibleAt(point) {
    const fogMapModel = this.get('fogMapModel');
    const tileMapModel = this.get('tileMapModel');

    // if already fully visibile, do nothing
    if (fogMapModel.isTileEqualTo(point, FOG_TYPES.VISIBLE)) {
      return;
    }

    // if adjacent tile is just an empty tile, let it be fully visible
    if (tileMapModel.isTileEqualTo(point, TILE_TYPES.EMPTY)) {
      fogMapModel.setTileAt(point, FOG_TYPES.VISIBLE);
      return;
    }

    // otherwise make it partially visible
    fogMapModel.setTileAt(point, FOG_TYPES.PARTIAL);
  }
  // -- user actions
  /**
   * updates all `canMove` attributes in a given user
   *
   * @param {UserModel} userModel
   */
  updateMovementActionsForUser(userModel) {
    const characterId = userModel.get('characterId');
    const characterModel = this.findCharacterById(characterId);

    userModel.set({
      canMoveLeft: this.isWalkableAt(characterModel.getPotentialPosition(POINTS.LEFT)),
      canMoveRight: this.isWalkableAt(characterModel.getPotentialPosition(POINTS.RIGHT)),
      canMoveUp: this.isWalkableAt(characterModel.getPotentialPosition(POINTS.UP)),
      canMoveDown: this.isWalkableAt(characterModel.getPotentialPosition(POINTS.DOWN)),
    });
  }
  /**
   * updates `canTrick` and `canTreat` attributes in a given user
   *
   * @param {UserModel} userModel
   */
  updateLocationActionsForUser(userModel) {
    const characterId = userModel.get('characterId');
    const characterModel = this.findCharacterById(characterId);
    const characterPosition = characterModel.get('position');


    const houseModelHere = this.findHouseAt(characterPosition);
    if (houseModelHere === undefined) {
      userModel.set({
        canTrick: false,
        canTreat: false,
      });
      return;
    };

    userModel.set({
      canTrick: houseModelHere.isTrickable(characterModel),
      canTreat: houseModelHere.isTreatable(characterModel),
    });
  }
  /**
   * picks a random adjacent point that a given character can be on
   *
   * @param {CharacterModel} characterModel
   * @returns {Point}
   */
  getRandomCharacterDirection(characterModel) {
    const potentialLeftPoint = characterModel.getPotentialPosition(POINTS.LEFT);
    const potentialRightPoint = characterModel.getPotentialPosition(POINTS.RIGHT);
    const potentialUpPoint = characterModel.getPotentialPosition(POINTS.UP);
    const potentialDownPoint = characterModel.getPotentialPosition(POINTS.DOWN);

    const choice = mathUtils.getRandomWeightedChoice([
      {
        chosenPoint: POINTS.LEFT,
        weight: this.isWalkableAt(potentialLeftPoint) ? 1 : 0,
      }, {
        chosenPoint: POINTS.RIGHT,
        weight: this.isWalkableAt(potentialRightPoint) ? 1 : 0,
      }, {
        chosenPoint: POINTS.UP,
        weight: this.isWalkableAt(potentialUpPoint) ? 1 : 0,
      }, {
        chosenPoint: POINTS.DOWN,
        weight: this.isWalkableAt(potentialDownPoint) ? 1 : 0,
      },
    ]);

    return choice.chosenPoint;
  }
  /**
   * user asked to move
   *
   * @param {String} userId
   * @param {String} actionId
   */
  handleUserActionMove(userId, actionId) {
    const characterModel = this.findCharacterByUserId(userId);
    if (!characterModel.canMove()) {
      return;
    }

    if (actionId === CLIENT_ACTIONS.MOVE.LEFT) {
      this.updateCharacterPosition(userId, 'left');
    }

    if (actionId === CLIENT_ACTIONS.MOVE.RIGHT) {
      this.updateCharacterPosition(userId, 'right');
    }

    if (actionId === CLIENT_ACTIONS.MOVE.UP) {
      this.updateCharacterPosition(userId, 'up');
    }

    if (actionId === CLIENT_ACTIONS.MOVE.DOWN) {
      this.updateCharacterPosition(userId, 'down');
    }

    // after the move, they lose a movement
    characterModel.modifyStat('movement', -1);

    // if they're now down to zero, end User's available actions
    if (!characterModel.canMove()) {
      this.onUserActionComplete(userId);
    }
  }
  /**
   * moves a Character a single direction
   *
   * @param {String} userId
   * @param {String} directionId
   */
  updateCharacterPosition(userId, directionId) {
    const characterModel = this.findCharacterByUserId(userId);
    const directionPoint = getPointFromString(directionId);

    // nothing to do if given direction is not walkable
    const nextPosition = characterModel.getPotentialPosition(directionPoint);
    if (!this.isWalkableAt(nextPosition)) {
      return;
    }

    // if there is an Encounter here, we should trigger it
    const encounterModelHere = this.findEncounterAt(nextPosition);
    if (encounterModelHere) {
      encounterModelHere.trigger(characterModel);
    }

    // finally update the character's position
    characterModel.set({position: nextPosition});
  }
  /**
   * user wants to Treat
   *
   * @param {String} userId
   */
  handleUserActionTreat(userId) {
    const characterModel = this.findCharacterByUserId(userId);
    const characterPosition = characterModel.get('position');

    // are you doing this at a house?
    const houseModelHere = this.findHouseAt(characterPosition);
    if (houseModelHere === undefined) {
      return;
    }

    // are you allowed to do this here?
    if (!houseModelHere.isTreatable(characterModel)) {
      return;
    }

    // ok cool
    houseModelHere.triggerTreat(characterModel);

    // end Actions
    this.onUserActionComplete(userId);
  }
  /**
   * user wants to Trick
   *
   * @param {String} userId
   */
  handleUserActionTrick(userId) {
    const characterModel = this.findCharacterByUserId(userId);
    const characterPosition = characterModel.get('position');

    // are you doing this at a house?
    const houseModelHere = this.findHouseAt(characterPosition);
    if (houseModelHere === undefined) {
      return;
    }

    // are you allowed to do this here?
    if (!houseModelHere.isTrickable(characterModel)) {
      return;
    }

    // ok cool
    houseModelHere.triggerTrick(characterModel);

    // end Actions
    this.onUserActionComplete(userId);
  }
  /**
   * user wants to Move to a specific spot
   *
   * @param {String} userId
   * @param {String} nextPosition
   */
  handleUserActionMoveTo(userId, nextPosition) {
    const characterModel = this.findCharacterByUserId(userId);
    const characterPosition = characterModel.get('position');
    const movement = characterModel.get('movement');

    // check if place Character is moving to is too far away
    const tileDistance = matrixUtils.getDistanceBetween(this.get('matrix'), characterPosition, nextPosition);
    if (tileDistance > movement) {
      return;
    }

    // check if destination is actually walkable
    if (!this.isWalkableAt(nextPosition)) {
      return;
    }

    // finally update the character's position
    characterModel.set({
      position: nextPosition,
      movement: movement - tileDistance,
    });
  }
  /**
   * a User's Action (and therefore a User's turn) was finished
   *
   * @param {String} userId
   */
  onUserActionComplete(userId) {
    const userModel = this.findUserById(userId);

    userModel.set({
      isUserTurn: false,
    });

    // next turn
    this.handleEndOfTurn();
  }
  // -- bulk methods
  /**
   * updates every User's actions
   */
  updateActionsForAllUsers() {
    this.get('users').forEach((userModel) => {
      this.updateMovementActionsForUser(userModel);
      this.updateLocationActionsForUser(userModel);
    });
  }
  // -- Game / Client handling
  /**
   * makes Game Users out of given Client
   *
   * @param {SocketClientModel} clientModel
   * @returns {UserModel | undefined} - returns the created `userModel`
   */
  createUserFromClient(clientModel) {
    // only make users out of those in Game and Remote Clients
    if (!clientModel.get('isInGame') || clientModel.get('clientType') !== CLIENT_TYPES.REMOTE) {
      return undefined;
    }

    // if this Client has an existing User, no need to create another one
    const userId = clientModel.get('userId');
    const existingUser = this.findUserById(userId);
    if (existingUser !== undefined) {
      return undefined;
    }

    const name = clientModel.get('name');
    const characterId = `${name}-character-id`;

    const newCharPosition = MAP_START.clone();
    const newCharacterModel = new FastCharacter({
      position: newCharPosition,
      name: `${name}-character`,
      characterId: characterId,
    });

    const newUserModel = new UserModel({
      name: name,
      characterId: characterId,
      userId: userId,
    });

    // add
    this.addCharacter(newCharacterModel);
    this.addUser(newUserModel);
    return newUserModel;
  }
}

export default GamestateModel;
