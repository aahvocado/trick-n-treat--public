import uuid from 'uuid/v4';
import seedrandom from 'seedrandom';

import { MAP_START } from 'constants/mapSettings';
import POINTS from 'constants/points';
import TILE_TYPES, { isWalkableTile } from 'constants/tileTypes';

import Point from '@studiomoniker/point';
import GamestateModel from 'models/GamestateModel';
import CharacterModel, { CPUCharacterModel } from 'models/CharacterModel';
import UserModel from 'models/UserModel';

import * as mapGenerationUtils from 'utilities/mapGenerationUtils';
import * as mathUtils from 'utilities/mathUtils';
import * as matrixUtils from 'utilities/matrixUtils';

// replace seed if we find something we like or want to debug with
const seed = uuid();
seedrandom(seed, { global: true });

// instantiate Gamestate when this Module is called
export const gamestateModel = new GamestateModel({
  users: [
    new UserModel({
      name: 'User Daidan',
      userId: 'TEST_USER_ID',
      characterId: 'WOW_CHARACTER_ID_SO_UNIQUE',
    })
  ],

  characters: [
    new CharacterModel({
      name: 'Elmo',
      characterId: 'WOW_CHARACTER_ID_SO_UNIQUE',
      typeId: 'ELMO_CHARACTER',
      position: MAP_START,
    }),
    new CPUCharacterModel({
      name: 'Big Bird',
      characterId: 'BIG_BIRD_TOTALLY_UNIQUE_ID',
      typeId: 'BIRD_CHARACTER',
      position: MAP_START,
      isCPU: true,
    }),
    new CPUCharacterModel({
      name: 'Cookie Monster',
      characterId: 'COOKIE_MONSTER_TOTALLY_UNIQUE_ID',
      typeId: 'COOKIE_CHARACTER',
      position: MAP_START,
      isCPU: true,
    }),
  ],
});
/**
 * checks if a given point on the tilemap is walkable
 *
 * @param {Point} characterModel
 * @returns {Boolean}
 */
export function isPointWalkable(point) {
  const tileMapModel = gamestateModel.get('tileMapModel');
  const foundTile = tileMapModel.getTileAt(point);
  return isWalkableTile(foundTile);
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
      weight: isPointWalkable(potentialLeftPoint) ? 1 : 0,
    }, {
      chosenPoint: POINTS.RIGHT,
      weight: isPointWalkable(potentialRightPoint) ? 1 : 0,
    }, {
      chosenPoint: POINTS.UP,
      weight: isPointWalkable(potentialUpPoint) ? 1 : 0,
    }, {
      chosenPoint: POINTS.DOWN,
      weight: isPointWalkable(potentialDownPoint) ? 1 : 0,
    },
  ]);

  return choice.chosenPoint;
}
/**
 * updates all `canMove` attributes in each user
 */
export function updateUserMovementActions() {
  const users = gamestateModel.get('users');

  users.forEach((userModel) => {
    const characterId = userModel.get('characterId');
    const characterModel = gamestateModel.findCharacter(characterId);

    userModel.set({
      canMoveLeft: isPointWalkable(characterModel.getPotentialPosition(POINTS.LEFT)),
      canMoveRight: isPointWalkable(characterModel.getPotentialPosition(POINTS.RIGHT)),
      canMoveUp: isPointWalkable(characterModel.getPotentialPosition(POINTS.UP)),
      canMoveDown: isPointWalkable(characterModel.getPotentialPosition(POINTS.DOWN)),
    })
  });
}
/**
 * updates `canTrick` and `canTreat` attributes in each user
 *  todo - flesh this out later
 */
export function updateUserLocationActions() {
  const tileMapModel = gamestateModel.get('tileMapModel');
  const users = gamestateModel.get('users');

  users.forEach((userModel) => {
    const characterId = userModel.get('characterId');
    const characterModel = gamestateModel.findCharacter(characterId);

    const isHouseTile = tileMapModel.isTileEqualTo(characterModel.get('position'), TILE_TYPES.HOUSE);
    userModel.set({
      canTrick: isHouseTile,
      canTreat: isHouseTile,
    })
  });
}
/**
 * moves a Character a single direction
 *
 * @param {String} characterId
 * @param {Point} directionPoint
 */
export function updateCharacterPosition(characterId, directionPoint) {
  const characterModel = gamestateModel.findCharacter(characterId);

  // nothing to do if given direction is not walkable
  if (!isPointWalkable(characterModel.getPotentialPosition(directionPoint))) {
    return;
  }

  characterModel.addToPosition(directionPoint);

  updateUserMovementActions();
  updateUserLocationActions();
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

  gamestateModel.attributes.users.push(newUserModel);

  return newUserModel;
}
//
console.log('\x1b[35m', 'Gamestate Instantiated with Seed', seed); // magenta
