import uuid from 'uuid/v4';
import seedrandom from 'seedrandom';

import {MAP_START} from 'constants/mapSettings';
import POINTS from 'constants/points';
import TILE_TYPES, {isWalkableTile, FOG_TYPES} from 'constants/tileTypes';

import GamestateModel from 'models/GamestateModel';
import CharacterModel/* , {CPUCharacterModel} */ from 'models/CharacterModel';
import UserModel from 'models/UserModel';

import * as mathUtils from 'utilities/mathUtils';

// replace seed if we find something we like or want to debug with
const seed = uuid();
seedrandom(seed, {global: true});

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
    // new CPUCharacterModel({
    //   name: 'Big Bird',
    //   characterId: 'BIG_BIRD_TOTALLY_UNIQUE_ID',
    //   typeId: 'BIRD_CHARACTER',
    //   position: MAP_START.clone(),
    //   isCPU: true,
    // }),
    // new CPUCharacterModel({
    //   name: 'Cookie Monster',
    //   characterId: 'COOKIE_MONSTER_TOTALLY_UNIQUE_ID',
    //   typeId: 'COOKIE_CHARACTER',
    //   position: MAP_START.clone(),
    //   isCPU: true,
    // }),
  ],
});
/**
 * properly set values once the model is set up
 */
export function start() {
  updateFogOfWarToVisibleAt(MAP_START);
  updateUserMovementActions();
  updateUserLocationActions();
  console.log('\x1b[35m', 'Gamestate Instantiated with Seed', seed);
}
/**
 * checks if a given point on the tilemap is walkable
 *
 * @param {Point} point
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
    });
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
    });
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
  const nextPosition = characterModel.getPotentialPosition(directionPoint);
  if (!isPointWalkable(nextPosition)) {
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
  updateFogOfWarToVisibleAt(nextPosition);
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
/**
 * gets the Encounter if there is one at given point
 *
 * @param {Point} point
 * @returns {EncounterModel | undefined}
 */
export function getEncounterAt(point) {
  const encounters = gamestateModel.get('encounters');
  return encounters.find((encounterModel) => {
    return point.equals(encounterModel.get('position'));
  });
}
/**
 * changes fog of war visibility
 *
 * @param {Point} point
 */
export function updateFogOfWarToVisibleAt(point) {
  const fogMapModel = gamestateModel.get('fogMapModel');
  const tileMapModel = gamestateModel.get('tileMapModel');

  // given tile is now visible
  fogMapModel.setTileAt(point, FOG_TYPES.VISIBLE);

  /**
   * handle updating an adjacent point
   *
   * @param {Point} adjPoint
   */
  const updatePartialVisibility = (adjPoint) => {
    // if already fully visibile, do nothing
    if (fogMapModel.isTileEqualTo(adjPoint, FOG_TYPES.VISIBLE)) {
      return;
    }

    // if adjacent tile is just an empty tile, let it be fully visible
    if (tileMapModel.isTileEqualTo(adjPoint, TILE_TYPES.EMPTY)) {
      fogMapModel.setTileAt(adjPoint, FOG_TYPES.VISIBLE);
      return;
    }

    // otherwise make it partially visible
    fogMapModel.setTileAt(adjPoint, FOG_TYPES.PARTIAL);
  };

  // update adjacent points
  updatePartialVisibility(point.clone().add(POINTS.LEFT));
  updatePartialVisibility(point.clone().add(POINTS.RIGHT));
  updatePartialVisibility(point.clone().add(POINTS.UP));
  updatePartialVisibility(point.clone().add(POINTS.DOWN));
}
