import seedrandom from 'seedrandom';
import {extendObservable} from 'mobx';


import {GAME_MODES} from 'constants/gameModes';
import TILE_TYPES, {FOG_TYPES, isWalkableTile} from 'constants/tileTypes';

import * as gamestateUserHelper from 'helpers/gamestateUserHelper';

import Model from 'models/Model';
import MapModel from 'models/MapModel';

import * as mapUtils from 'utilities/mapUtils';
import * as matrixUtils from 'utilities/matrixUtils';

/**
 * A note on this Gamestate Model and the other helper files:
 * Hypothetically, everything in the helpers could be a method in this class
 *  but I'm trying to let this model be very generalized getters
 *  with the helpers doing more complex actions
 */

// seed for generating gamestate
const seed = Date.now();
seedrandom(seed, {global: true});
/**
 *
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
      gamestateUserHelper.updateActionsForAllUsers();
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

    console.log('\x1b[36m', `Gamestate instantiated - (Seed "${seed}")`);
  }
  // -- Character methods
  /**
   * @param {CharacterModel} characterModel
   */
  addCharacter(characterModel) {
    this.addToArray('characters', characterModel);

    // attach onChange listeners to the character - probably can be set up better elsewhere
    characterModel.onChange('position', (position) => {
      this.updateToVisibleAt(position, characterModel.get('vision'));
      gamestateUserHelper.updateActionsForAllUsers();
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
      const encounterPosition = encounterModel.get('position');
      return point.equals(encounterPosition);
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
      const housePosition = houseModel.get('position');
      return point.equals(housePosition);
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
  // -- Fog methods
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
    const nearbyPoints = mapUtils.getPointsWithinPathDistance(this.get('tileMapModel').get('matrix'), point, distance);
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
}
/**
 * Gamestate Singleton
 *
 * @type {GamestateModel}
 */
const gameState = new GamestateModel();
export default gameState;
