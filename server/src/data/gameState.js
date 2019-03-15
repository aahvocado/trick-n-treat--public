import {
  observable,
  reaction,
  toJS,
} from 'mobx';
import seedrandom from 'seedrandom';

const seed = Date.now();
seedrandom(seed, {global: true});

import {FastCharacter} from 'collections/characterCollection';

import {CLIENT_ACTIONS} from 'constants/clientActions';
import {CLIENT_TYPES} from 'constants/clientTypes';
import {MAP_START} from 'constants/mapSettings';
import POINTS, {getPointFromString} from 'constants/points';
import TILE_TYPES, {FOG_TYPES, isWalkableTile} from 'constants/tileTypes';

import * as serverAppState from 'data/serverAppState';

import Model from 'models/Model';
import MapModel from 'models/MapModel';
import UserModel from 'models/UserModel';

import * as gamestateUtils from 'utilities/gamestateUtils';
import * as mathUtils from 'utilities/mathUtils';
import * as matrixUtils from 'utilities/matrixUtils';

/**
 * @typedef {String} GameMode
 */
export const GAME_MODES = {
  INACTIVE: 'GAME-INACTIVE-MODE',
  ACTIVE: 'GAME-ACTIVE-MODE',
  PAUSED: 'GAME-PAUSED-MODE',
  WORKING: 'GAME-WORKING-MODE',
};
/**
 * state of the Game
 */
const users = observable.array();
const characters = observable.array();
const encounters = observable.array();
const appStore = observable({
  /** @type {GameMode} */
  mode: GAME_MODES.INACTIVE,

  /** @type {Array<CharacterModel>} */
  turnQueue: [],
  /** @type {UserModel} */
  get activeUser() {
    return getActiveUser();
  },
  /** @type {CharacterModel} */
  get activeCharacter() {
    return getActiveCharacter();
  },

  /** @type {Array<UserModel>} */
  users: users,
  /** @type {Array<CharacterModel>} */
  characters: characters,
  /** @type {Array<EncounterModel>} */
  encounters: encounters,
  /** @type {MapModel} */
  tileMapModel: MapModel,
  /** @type {MapModel} */
  fogMapModel: MapModel,
});
/**
 * listen to when the Server switches to Game Mode
 */
serverAppState.onChange('mode', (newMode) => {
  update({mode: GAME_MODES.WORKING});

  // if not in Game Mode, do nothing
  if (newMode !== 'GAME-MODE') {
    update({mode: GAME_MODES.INACTIVE});
    return;
  }

  // initialize
  init();
  update({mode: GAME_MODES.ACTIVE});

  console.log('\x1b[36m', 'Game Started!', `(Seed "${seed})"`);
  gamestateUtils.displayTurnQueue(getState());
});
/**
 *
 */
function init() {
  const baseTileMapModel = gamestateUtils.createBaseTileMapModel();
  const encounterList = gamestateUtils.createEncounterList(baseTileMapModel);
  const fogMapModel = gamestateUtils.createFogOfWarModel(baseTileMapModel);

  update({
    tileMapModel: baseTileMapModel,
    encounters: encounterList,
    fogMapModel: fogMapModel,
  });

  const serverStateObj = serverAppState.getState();
  createUsers(serverStateObj.clients);

  const turnQueue = buildTurnQueue();
  update({
    turnQueue: turnQueue,
  });
}
// -- helper methods
/**
 * @param {String} characterId
 * @returns {CharacterModel}
 */
export function findCharacterById(characterId) {
  return appStore.characters.find((characterModel) => {
    return characterModel.get('characterId') === characterId;
  });
}
/**
 * @param {String} userId
 * @returns {UserModel}
 */
export function findUserById(userId) {
  return appStore.users.find((userModel) => {
    return userModel.get('userId') === userId;
  });
}
/**
 * @param {String} userId
 * @returns {CharacterModel}
 */
export function findCharacterByUserId(userId) {
  const userModel = findUserById(userId);
  const characterId = userModel.get('characterId');
  return findCharacterById(characterId);
}
/**
 * @param {String} characterId
 * @returns {CharacterModel}
 */
export function findUserByCharacterId(characterId) {
  const users = appStore.users.slice();
  return users.find((user) => (user.get('characterId') === characterId));
}
/**
 * @param {Point} point
 * @returns {Boolean}
 */
export function isWalkableAt(point) {
  const tileMapModel = appStore.tileMapModel;
  const foundTile = tileMapModel.getTileAt(point);
  return isWalkableTile(foundTile);
}
/**
 * gets the Encounter if there is one at given point
 *
 * @param {Point} point
 * @returns {EncounterModel | undefined}
 */
export function getEncounterAt(point) {
  const encounters = appStore.encounters.slice();
  return encounters.find((encounterModel) => {
    const encounterPosition = encounterModel.get('position');
    return point.equals(encounterPosition);
  });
}
/**
 * @param {UserModel} userModel
 */
export function addUser(userModel) {
  const oldUsers = appStore.users.slice();
  const newUsers = [].concat(oldUsers);
  newUsers.push(userModel);
  update({users: newUsers});
}
/**
 * @param {UserModel} userModel
 */
export function removeUser(userModel) {
  const oldUsers = appStore.users.slice();
  const newUsers = oldUsers.filter((user) => (user.get('userId') !== userModel.get('userId')));
  update({users: newUsers});
}
/**
 * @param {CharacterModel} characterModel
 */
export function addCharacter(characterModel) {
  const oldCharacters = appStore.characters.slice();
  const newCharacters = [].concat(oldCharacters);
  newCharacters.push(characterModel);
  update({characters: newCharacters});
}
/**
 * @param {CharacterModel} characterModel
 */
export function removeCharacter(characterModel) {
  const oldCharacters = appStore.characters.slice();
  const newCharacters = oldCharacters.filter((character) => (character.get('characterId') !== characterModel.get('characterId')));
  update({characters: newCharacters});
}
/**
 * rebuilds a Turn Queue based on everything
 *
 * @returns {Array<CharacterModel>}
 */
export function buildTurnQueue() {
  const characters = appStore.characters.slice();
  return matrixUtils.shuffleArray(characters);
}
/**
 * returns the Character whose is currently acting
 * (null probably means the game hasn't started)
 *
 * @returns {CharacterModel | null}
 */
function getActiveCharacter() {
  const turnQueue = appStore.turnQueue.slice();
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
 * @returns {UserModel | null}
 */
function getActiveUser() {
  const activeCharacter = getActiveCharacter();

  // no character is active, means no user is active
  if (activeCharacter === null) {
    return null;
  }

  const activeUser = findUserByCharacterId(activeCharacter.get('characterId'));

  // if no matching user, then it belongs to an NPC
  if (activeUser === undefined) {
    return null;
  }

  return activeUser;
}
// -- isolated update methods
/**
 * User did something
 *
 * @param {String} userId
 * @param {String} actionId
 */
export function handleUserGameAction(userId, actionId) {
  if (actionId === CLIENT_ACTIONS.MOVE.LEFT) {
    updateCharacterPosition(userId, 'left');
    return;
  }

  if (actionId === CLIENT_ACTIONS.MOVE.RIGHT) {
    updateCharacterPosition(userId, 'right');
    return;
  }

  if (actionId === CLIENT_ACTIONS.MOVE.UP) {
    updateCharacterPosition(userId, 'up');
    return;
  }

  if (actionId === CLIENT_ACTIONS.MOVE.DOWN) {
    updateCharacterPosition(userId, 'down');
    return;
  }
}
/**
 * updates all `canMove` attributes in a given user
 *
 * @param {UserModel} userModel
 */
export function updateMovementActionsForUser(userModel) {
  const characterId = userModel.get('characterId');
  const characterModel = findCharacterById(characterId);

  userModel.set({
    canMoveLeft: isWalkableAt(characterModel.getPotentialPosition(POINTS.LEFT)),
    canMoveRight: isWalkableAt(characterModel.getPotentialPosition(POINTS.RIGHT)),
    canMoveUp: isWalkableAt(characterModel.getPotentialPosition(POINTS.UP)),
    canMoveDown: isWalkableAt(characterModel.getPotentialPosition(POINTS.DOWN)),
  });
}
/**
 * updates `canTrick` and `canTreat` attributes in a given user
 *
 * @param {UserModel} userModel
 */
export function updateLocationActionsForUser(userModel) {
  const characterId = userModel.get('characterId');
  const characterModel = findCharacterById(characterId);

  const tileMapModel = appStore.tileMapModel;
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
export function updateToVisibleAt(point) {
  const fogMapModel = appStore.fogMapModel;

  // given tile is now visible
  fogMapModel.setTileAt(point, FOG_TYPES.VISIBLE);

  // update adjacent points
  updateToPartiallyVisibleAt(point.clone().add(POINTS.LEFT));
  updateToPartiallyVisibleAt(point.clone().add(POINTS.RIGHT));
  updateToPartiallyVisibleAt(point.clone().add(POINTS.UP));
  updateToPartiallyVisibleAt(point.clone().add(POINTS.DOWN));
}
/**
 * updates Fog of War visibility to Partially visible at a given point
 *
 * @param {Point} point
 */
export function updateToPartiallyVisibleAt(point) {
  const fogMapModel = appStore.fogMapModel;
  const tileMapModel = appStore.tileMapModel;

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
export function getRandomCharacterDirection(characterModel) {
  const potentialLeftPoint = characterModel.getPotentialPosition(POINTS.LEFT);
  const potentialRightPoint = characterModel.getPotentialPosition(POINTS.RIGHT);
  const potentialUpPoint = characterModel.getPotentialPosition(POINTS.UP);
  const potentialDownPoint = characterModel.getPotentialPosition(POINTS.DOWN);

  const choice = mathUtils.getRandomWeightedChoice([
    {
      chosenPoint: POINTS.LEFT,
      weight: isWalkableAt(potentialLeftPoint) ? 1 : 0,
    }, {
      chosenPoint: POINTS.RIGHT,
      weight: isWalkableAt(potentialRightPoint) ? 1 : 0,
    }, {
      chosenPoint: POINTS.UP,
      weight: isWalkableAt(potentialUpPoint) ? 1 : 0,
    }, {
      chosenPoint: POINTS.DOWN,
      weight: isWalkableAt(potentialDownPoint) ? 1 : 0,
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
export function updateCharacterPosition(userId, directionId) {
  const characterModel = findCharacterByUserId(userId);
  const directionPoint = getPointFromString(directionId);

  // nothing to do if given direction is not walkable
  const nextPosition = characterModel.getPotentialPosition(directionPoint);
  if (!isWalkableAt(nextPosition)) {
    return;
  }

  // if there is an Encounter here, we should trigger it
  const encounterModelHere = getEncounterAt(nextPosition);
  if (encounterModelHere) {
    encounterModelHere.trigger(characterModel);
  }

  // finally update the character's position
  characterModel.set({position: nextPosition});

  // ! - update other state attributes
  updateToVisibleAt(nextPosition);
  updateActionsForAllUsers();
}
// -- larger scale update methods
/**
 * updates every User's actions
 */
export function updateActionsForAllUsers() {
  appStore.users.forEach((userModel) => {
    updateMovementActionsForUser(userModel);
    updateLocationActionsForUser(userModel);
  });
}
/**
 * makes Game Users out of given list of Clients
 *
 * @param {Array<SocketClientModels>} clients
 */
function createUsers(clients) {
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
      name: `character-for-${name}`,
      characterId: characterId,
    });

    const newUserModel = new UserModel({
      name: name,
      characterId: characterId,
      userId: clientModel.get('userId'),
    });

    // add
    addCharacter(newCharacterModel);
    addUser(newUserModel);
    updateToVisibleAt(newCharPosition);
  });

  updateActionsForAllUsers();
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
 * gets the non-observable, non-reactable version of the store,
 *  effectively making a shallow copy
 *
 * @returns {Object}
 */
export function getState() {
  return toJS(appStore);
}
/**
 * this returns the completely plain version
 * @returns {Object}
 */
export function exportState() {
  const exportObject = {};
  const stateObject = toJS(appStore);

  const keys = Object.keys(stateObject);
  keys.forEach((attributeName) => {
    const attributeValue = stateObject[attributeName];

    // if value is a Model then use that Model's export
    if (attributeValue instanceof Model) {
      exportObject[attributeName] = attributeValue.export();
      return;
    }

    // check if we have an array of Models
    if (Array.isArray(attributeValue)) {
      const isArrayOfModels = attributeValue[0] instanceof Model;

      if (isArrayOfModels) {
        exportObject[attributeName] = attributeValue.map((model) => (model.export()));
        return;
      }
    }

    // assign the value
    exportObject[attributeName] = attributeValue;
  });

  return exportObject;
}

