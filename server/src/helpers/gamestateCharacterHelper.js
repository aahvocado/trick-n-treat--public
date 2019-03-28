import POINTS, {getPointFromString} from 'constants/points';

import gameState from 'data/gameState';

import * as mathUtils from 'utilities/mathUtils';

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
 * moves a Character a single direction
 *
 * @param {String} userId
 * @param {String} directionId
 */
export function updateCharacterPosition(userId, directionId) {
  const characterModel = gameState.findCharacterByUserId(userId);
  const directionPoint = getPointFromString(directionId);

  // nothing to do if given direction is not walkable
  const nextPosition = characterModel.getPotentialPosition(directionPoint);
  if (!gameState.isWalkableAt(nextPosition)) {
    return;
  }

  // if there is an Encounter here, we should trigger it
  const encounterModelHere = gameState.findEncounterAt(nextPosition);
  if (encounterModelHere) {
    encounterModelHere.trigger(characterModel);
  }

  // finally update the character's position
  characterModel.set({position: nextPosition});
}
