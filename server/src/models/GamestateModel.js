import {FastCharacter} from 'collections/characterCollection';

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

      /** @type {Array<CharacterModel>} */
      turnQueue: [],
      /** @type {UserModel} */
      get activeUser() {
        return getActiveUser(this);
      },
      /** @type {CharacterModel} */
      get activeCharacter() {
        return getActiveCharacter(this);
      },

      /** @type {Array<UserModel>} */
      users: [],
      /** @type {Array<CharacterModel>} */
      characters: [],
      /** @type {Array<EncounterModel>} */
      encounters: [],
      /** @type {MapModel} */
      tileMapModel: MapModel,
      /** @type {MapModel} */
      fogMapModel: MapModel,
      //
      ...newAttributes,
    });

    // -- react to my own state changing
    /**
     * if `characters` change, update user actions`
     */
    this.onChange('characters', () => {
      this.updateActionsForAllUsers();
    });
  }
  // -- helper methods
  /**
   * @param {String} characterId
   * @returns {CharacterModel}
   */
  findCharacterById(characterId) {
    return this.get('characters').find((characterModel) => {
      return characterModel.get('characterId') === characterId;
    });
  }
  /**
   * @param {String} userId
   * @returns {UserModel}
   */
  findUserById(userId) {
    return this.get('users').find((userModel) => {
      return userModel.get('userId') === userId;
    });
  }
  /**
   * @param {String} userId
   * @returns {CharacterModel}
   */
  findCharacterByUserId(userId) {
    const userModel = this.findUserById(userId);
    const characterId = userModel.get('characterId');
    return this.findCharacterById(characterId);
  }
  /**
   * @param {String} characterId
   * @returns {CharacterModel}
   */
  findUserByCharacterId(characterId) {
    const users = this.get('users').slice();
    return users.find((user) => (user.get('characterId') === characterId));
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
  getEncounterAt(point) {
    const encounters = this.get('encounters').slice();
    return encounters.find((encounterModel) => {
      const encounterPosition = encounterModel.get('position');
      return point.equals(encounterPosition);
    });
  }
  /**
   * @param {UserModel} userModel
   */
  addUser(userModel) {
    const oldUsers = this.get('users').slice();
    const newUsers = [].concat(oldUsers);
    newUsers.push(userModel);
    this.set({users: newUsers});
  }
  /**
   * @param {UserModel} userModel
   */
  removeUser(userModel) {
    const oldUsers = this.get('users').slice();
    const newUsers = oldUsers.filter((user) => (user.get('userId') !== userModel.get('userId')));
    this.set({users: newUsers});
  }
  /**
   * @param {CharacterModel} characterModel
   */
  addCharacter(characterModel) {
    const oldCharacters = this.get('characters').slice();
    const newCharacters = [].concat(oldCharacters);
    newCharacters.push(characterModel);
    this.set({characters: newCharacters});

    // attach onChange listeners to the character - probably can be set up better elsewhere
    characterModel.onChange('position', (position) => {
      this.updateToVisibleAt(position);
      this.updateActionsForAllUsers();
    });
  }
  /**
   * @param {CharacterModel} characterModel
   */
  removeCharacter(characterModel) {
    const oldCharacters = this.get('characters').slice();
    const newCharacters = oldCharacters.filter((character) => (character.get('characterId') !== characterModel.get('characterId')));
    this.set({characters: newCharacters});
  }
  /**
   * builds a Turn Queue based on stuff
   */
  initTurnQueue() {
    const characters = this.get('characters').slice();
    const newTurnQueue = matrixUtils.shuffleArray(characters);
    this.set({turnQueue: newTurnQueue});

    const activeUser = this.get('activeUser');
    activeUser.set({isUserTurn: true});
  }
  /**
   * updates the `turnQueue`
   */
  handleNextTurn() {
    const currentTurnQueue = this.get('turnQueue').slice();
    const oldActiveCharacter = currentTurnQueue.shift();
    const activeUser = this.get('activeUser');

    // if the current `activeCharacter` is a User, say its not their turn
    if (activeUser !== undefined) {
      activeUser.set({isUserTurn: false});
    }

    // move the previous `activeCharacter` to the end of the `turnQueue`
    const newTurnQueue = [].concat(currentTurnQueue);
    newTurnQueue.push(oldActiveCharacter);

    const newActiveCharacter = newTurnQueue[0];
    const newActiveUser = this.findUserByCharacterId(newActiveCharacter.get('characterId'));

    // if the new `activeCharacter` would be a User, say its their turn
    if (newActiveUser !== undefined) {
      newActiveUser.set({isUserTurn: true});
    }

    this.set({turnQueue: newTurnQueue});
  }
  // -- isolated update methods
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

    const tileMapModel = this.get('tileMapModel');
    const isHouseTile = tileMapModel.isTileEqualTo(characterModel.get('position'), TILE_TYPES.HOUSE);

    userModel.set({
      canTrick: isHouseTile,
      canTreat: isHouseTile,
    });
  }
  /**
   * updates Fog of War visibility to Fully visible at a given point
   *
   * @param {Point} point
   */
  updateToVisibleAt(point) {
    const fogMapModel = this.get('fogMapModel');

    // given tile is now visible
    fogMapModel.setTileAt(point, FOG_TYPES.VISIBLE);

    // update adjacent points
    this.updateToPartiallyVisibleAt(point.clone().add(POINTS.LEFT));
    this.updateToPartiallyVisibleAt(point.clone().add(POINTS.RIGHT));
    this.updateToPartiallyVisibleAt(point.clone().add(POINTS.UP));
    this.updateToPartiallyVisibleAt(point.clone().add(POINTS.DOWN));
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
    const encounterModelHere = this.getEncounterAt(nextPosition);
    if (encounterModelHere) {
      encounterModelHere.trigger(characterModel);
    }

    // finally update the character's position
    characterModel.set({position: nextPosition});
  }
  // -- larger scale update methods
  /**
   * updates every User's actions
   */
  updateActionsForAllUsers() {
    this.get('users').forEach((userModel) => {
      this.updateMovementActionsForUser(userModel);
      this.updateLocationActionsForUser(userModel);
    });
  }
  /**
   * makes Game Users out of given list of Clients
   *
   * @param {Array<SocketClientModels>} clients
   */
  createUsersFromClients(clients) {
    clients.forEach((clientModel) => {
      // only make users out of those in Game and Remote Clients
      if (!clientModel.get('isInGame') || clientModel.get('clientType') !== CLIENT_TYPES.REMOTE) {
        return;
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
        userId: clientModel.get('userId'),
      });

      // add
      this.addCharacter(newCharacterModel);
      this.addUser(newUserModel);
    });
  }
  /**
   * logs the current order of turns
   */
  displayTurnQueue() {
    let displayList = '';

    const turnQueue = this.get('turnQueue');
    for (let i = 0; i < turnQueue.length; i++) {
      const characterModel = turnQueue[i];
      displayList += `\n${i + 1}. "${characterModel.get('name')}"`;
    }

    console.log('\x1b[93m', 'Turn Order' + displayList);
  }
}
/**
 * returns the Character whose is currently acting
 * (null probably means the game hasn't started)
 *
 * @param {MobX.Observable.Object} state
 * @returns {CharacterModel | null}
 */
function getActiveCharacter(state) {
  const turnQueue = state.turnQueue.slice();
  const activeCharacter = turnQueue[0];

  // not started yet
  if (activeCharacter === undefined) {
    return null;
  }

  return activeCharacter;
}
/**
 * returns the User whose character's is Active,
 * - null if there is no `activeCharacter`
 * - null if `activeCharacter` is an NPC
 *
 * @param {MobX.Observable.Object} state
 * @returns {UserModel | null}
 */
function getActiveUser(state) {
  const turnQueue = state.turnQueue.slice();
  const activeCharacter = turnQueue[0];

  // no character is active, means no user is active
  if (activeCharacter === null) {
    return null;
  }

  const activeUser = state.users.find((user) => (user.get('characterId') === activeCharacter.get('characterId')));

  // if no matching user, then it belongs to an NPC
  if (activeUser === undefined) {
    return null;
  }

  return activeUser;
}

export default GamestateModel;
