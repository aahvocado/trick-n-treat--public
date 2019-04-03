// import {GAME_MODES} from 'constants/gameModes';
import POINTS, {getPointFromString} from 'constants/points';

import gameState from 'data/gameState';

import * as gamestateUserHelper from 'helpers/gamestateUserHelper';

import * as mapUtils from 'utilities/mapUtils';
import * as mathUtils from 'utilities/mathUtils';

import logger from 'utilities/logger';

/**
 * this Helper is for applying actions to Characters
 */

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
      weight: gameState.isWalkableAt(potentialLeftPoint) ? 1 : 0,
    }, {
      chosenPoint: POINTS.RIGHT,
      weight: gameState.isWalkableAt(potentialRightPoint) ? 1 : 0,
    }, {
      chosenPoint: POINTS.UP,
      weight: gameState.isWalkableAt(potentialUpPoint) ? 1 : 0,
    }, {
      chosenPoint: POINTS.DOWN,
      weight: gameState.isWalkableAt(potentialDownPoint) ? 1 : 0,
    },
  ]);

  return choice.chosenPoint.clone();
}
/**
 * moves a Character to a given Position
 *
 * @param {CharacterModel} characterModel
 * @param {Point} nextPosition
 */
export function updateCharacterPosition(characterModel, nextPosition) {
  // nothing to do if given direction is not walkable
  if (!gameState.isWalkableAt(nextPosition)) {
    return;
  }

  // finally update the character's position and map visibility
  characterModel.set({position: nextPosition});
  gameState.updateToVisibleAt(nextPosition, characterModel.get('vision'));

  // check if there is an Encounter here
  const encounterModelHere = gameState.findEncounterAt(nextPosition);
  if (encounterModelHere === undefined) {
    return;
  }

  // if there is one, then we can add the Encounter Trigger to the `actionQueue`
  gameState.insertIntoActionQueue(() => {
    logger.verbose(`(encounter at [x: ${nextPosition.x}, y: ${nextPosition.y}])`);
    encounterModelHere.trigger(characterModel);
  });
}
/**
 * moves a Character a single direction
 *
 * @param {CharacterModel} characterModel
 * @param {String} directionId
 */
export function updateCharacterPositionByDirection(characterModel, directionId) {
  const directionPoint = getPointFromString(directionId);
  const nextPosition = characterModel.getPotentialPosition(directionPoint);
  updateCharacterPosition(characterModel, nextPosition);
}
/**
 * moves a Character a single direction
 *
 * @param {CharacterModel} characterModel
 * @param {String} endPoint
 */
export function handleMoveCharacterTo(characterModel, endPoint) {
  // check if destination is actually walkable
  if (!gameState.isWalkableAt(endPoint)) {
    return;
  }

  // make the potential path the Character will walk,
  const characterPos = characterModel.get('position');
  const movePath = mapUtils.getAStarPath(gameState.get('tileMapModel').get('matrix'), characterPos, endPoint);
  movePath.shift(); // remove the first Point, which is the one the Character is on

  // check if destination is too far away
  const movement = characterModel.get('movement');
  if (movePath.length > movement) {
    return;
  }

  logger.verbose(`(moving "${characterModel.get('name')}" to [x: ${endPoint.x}, y: ${endPoint.y}])`);

  // take one step at a time for moving along the path
  movePath.forEach((pathPoint) => {
    gameState.addToActionQueue(() => {
      // subtract a Movement
      characterModel.modifyStat('movement', -1);

      // attempt to update the character's position
      updateCharacterPosition(characterModel, pathPoint);

      // we're going to consider this one movement as an end of action
      const userModel = gameState.findUserByCharacterId(characterModel.get('characterId'));
      gamestateUserHelper.onUserActionComplete(userModel);
    });
  });
}
