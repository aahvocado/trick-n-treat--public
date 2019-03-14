import EventEmitter from 'events';
import uuid from 'uuid/v4';
import seedrandom from 'seedrandom';

import {MAP_START} from 'constants/mapSettings';
import POINTS, {getPointFromString} from 'constants/points';

import GamestateModel from 'models/GamestateModel';
import CharacterModel from 'models/CharacterModel';
import UserModel from 'models/UserModel';

import * as gamestateUtils from 'utilities/gamestateUtils';
import * as mathUtils from 'utilities/mathUtils';

// replace seed if we find something we like or want to debug with
const seed = uuid();
seedrandom(seed, {global: true});

// to hopefully decouple events
export const gamestateEmitter = new EventEmitter();

// instantiate Gamestate when this Module is called
export const gamestateModel = new GamestateModel({
  users: [
    new UserModel({
      name: 'User Daidan',
      userId: 'TEST_USER_ID',
      characterId: 'WOW_CHARACTER_ID_SO_UNIQUE',
    }),
  ],

  characters: [
    new CharacterModel({
      name: 'Almo',
      characterId: 'WOW_CHARACTER_ID_SO_UNIQUE',
      typeId: 'ALMO_CHARACTER',
      position: MAP_START.clone(),
    }),
  ],
});
/**
 * properly set values once the model is set up
 */
export function start() {
  gamestateUtils.initBaseGamestateModel(gamestateModel);
  gamestateModel.updateToVisibleAt(MAP_START);
  gamestateModel.updateActionsForAllUsers();
  console.log('\x1b[35m', 'Gamestate Instantiated with Seed', seed);
  gamestateEmitter.emit('COMPLETE_GAME_INIT');
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
 * moves a Character a single direction
 *
 * @param {Object} config
 * @returns {UserModel} - the UserModel that was created
 */
export function createNewUser(config) {
  const newUserModel = new UserModel({
    name: config.name,
    userId: config.id,
    characterId: 'WOW_CHARACTER_ID_SO_UNIQUE', // todo
  });

  gamestateModel.addUser(newUserModel);

  return newUserModel;
}

