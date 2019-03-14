import EventEmitter from 'events';
import uuid from 'uuid/v4';
import seedrandom from 'seedrandom';

import {FastCharacter} from 'collections/characterCollection';

import {MAP_START} from 'constants/mapSettings';
import POINTS, {getPointFromString} from 'constants/points';

import GamestateModel from 'models/GamestateModel';
import UserModel from 'models/UserModel';

import * as gamestateUtils from 'utilities/gamestateUtils';
import * as mathUtils from 'utilities/mathUtils';

// replace seed if we find something we like or want to debug with
const seed = uuid();
seedrandom(seed, {global: true});

// set up to hopefully decouple events
export const gamestateEmitter = new EventEmitter();

// instantiate Gamestate
const gamestateModel = new GamestateModel();
/**
 * gets the basic object version of the Gamestate
 * @returns {Object}
 */
export function getGamestate() {
  return gamestateModel.export();
}
/**
 * properly set values once the model is set up
 */
export function start() {
  gamestateUtils.initBaseGamestateModel(gamestateModel);
  gamestateModel.updateToVisibleAt(MAP_START);
  gamestateModel.updateActionsForAllUsers();
  console.log('\x1b[35m', `Gamestate Instantiated with Seed "${seed}"`);
  gamestateEmitter.emit('INIT_COMPLETE');
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
      weight: gamestateModel.isWalkableAt(potentialLeftPoint) ? 1 : 0,
    }, {
      chosenPoint: POINTS.RIGHT,
      weight: gamestateModel.isWalkableAt(potentialRightPoint) ? 1 : 0,
    }, {
      chosenPoint: POINTS.UP,
      weight: gamestateModel.isWalkableAt(potentialUpPoint) ? 1 : 0,
    }, {
      chosenPoint: POINTS.DOWN,
      weight: gamestateModel.isWalkableAt(potentialDownPoint) ? 1 : 0,
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
  const characterModel = gamestateModel.findCharacterByUserId(userId);
  const directionPoint = getPointFromString(directionId);

  // nothing to do if given direction is not walkable
  const nextPosition = characterModel.getPotentialPosition(directionPoint);
  if (!gamestateModel.isWalkableAt(nextPosition)) {
    return;
  }

  // if there is an Encounter here, we should trigger it
  const encounterModelHere = gamestateModel.getEncounterAt(nextPosition);
  if (encounterModelHere) {
    encounterModelHere.trigger(characterModel);
  }

  // finally update the character's position
  characterModel.set({position: nextPosition});

  // ! - update other state attributes
  gamestateModel.updateToVisibleAt(nextPosition);
  gamestateModel.updateActionsForAllUsers();
  gamestateEmitter.emit('UPDATES_COMPLETE');
}
/**
 * creates a new User and Character (for now)
 * and add them to the Gamestate
 *
 * @param {Object} userAttributes
 * @returns {UserModel}
 */
export function createAndAddNewUser(userAttributes) {
  const {name} = userAttributes;
  const characterId = `${name}-character-id`;

  // create a new Character for this User
  const newCharPosition = MAP_START.clone();
  const newCharacterModel = new FastCharacter({
    position: newCharPosition,
    name: `character-for-${name}`,
    characterId: characterId,
  });

  // make the new User, passing in the `characterId` that links it with the character
  const newUserModel = new UserModel({
    characterId: characterId,
    ...userAttributes,
  });

  // add to gamestate
  gamestateModel.addCharacter(newCharacterModel);
  gamestateModel.addUser(newUserModel);

  // ! - update everything else
  gamestateModel.updateToVisibleAt(newCharPosition);
  gamestateModel.updateActionsForAllUsers();
  gamestateEmitter.emit('UPDATES_COMPLETE');
  return newUserModel;
}
/**
 * removes a User and its Character (for now)
 *
 * @param {String} userId
 */
export function removeUserData(userId) {
  const characterModel = gamestateModel.findCharacterByUserId(userId);
  const userModel = gamestateModel.findUserById(userId);

  gamestateModel.removeCharacter(characterModel);
  gamestateModel.removeUser(userModel);
}
