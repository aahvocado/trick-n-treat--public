import {isWalkableTile} from 'constants.shared/tileTypes';

import gameState from 'state/gameState';

// import logger from 'utilities/logger.game';

import * as lightLevelUtils from 'utilities.shared/lightLevelUtils';
import * as matrixUtils from 'utilities.shared/matrixUtils';

/**
 * helper for Gamestate specific Map functions
 */

// -- Map
/**
 * @param {Point} point
 * @returns {Boolean}
 */
export function isWalkableAt(point) {
  const tileMapModel = gameState.get('tileMapModel');
  const foundTile = tileMapModel.getTileAt(point);
  return isWalkableTile(foundTile);
}
/**
 * determines if there is are any Encounter within path distance
 *
 * @param {Point} startPoint
 * @param {Number} [distance]
 * @returns {Boolean}
 */
export function isNearEncounterAt(startPoint, distance = 2) {
  const encounterList = gameState.get('encounterList');
  const tileMapModel = gameState.get('tileMapModel');

  return encounterList.some((encounterModel) => {
    const encounterLocation = encounterModel.get('location');
    return tileMapModel.isWithinPathDistance(startPoint, encounterLocation, distance);
  });
}
/**
 * gets Encounters near point within path distance
 *
 * @param {Point} startPoint
 * @param {Number} [distance]
 * @returns {Array<EncounterModel>}
 */
export function getEncountersNear(startPoint, distance = 2) {
  const encounterList = gameState.get('encounterList');
  const tileMapModel = gameState.get('tileMapModel');

  return encounterList.filter((encounterModel) => {
    const encounterLocation = encounterModel.get('location');
    return tileMapModel.isWithinPathDistance(startPoint, encounterLocation, distance);
  });
}
/**
 * gets Encounters that are within movement distance of any character
 *
 * @returns {Array<EncounterModel>}
 */
export function getVisibleEncounterList() {
  // no characters mean nothing is visible
  const characterList = gameState.get('characterList');
  if (characterList.length <= 0) {
    return [];
  }

  const encounterList = gameState.get('encounterList');
  const tileMapModel = gameState.get('tileMapModel');

  // go through all the Encounters
  const visibleEncounters = encounterList.filter((encounterModel, idx) => {
    const encounterLocation = encounterModel.get('location');

    // check if any of the Characters can see this Encounter
    const isVisibleToAnyCharacter = characterList.some((characterModel) => {
      const characterLocation = characterModel.get('position');
      const characterRange = characterModel.get('baseMovement');
      return tileMapModel.isWithinPathDistance(encounterLocation, characterLocation, characterRange);
    });

    // not visible
    if (!isVisibleToAnyCharacter) {
      return false;
    }

    // visible, and keep track of this encounter's index from the original `encounterList``
    encounterModel.originalListIdx = idx;
    return true;
  });

  // return the visible encounters
  return visibleEncounters;
};
// -- Light
/**
 * updates visibility at a given point
 *
 * @param {Point} startPoint
 * @param {Number} vision - (0 to 10)
 * @param {Object} [options]
 */
export function updateLightLevelsAt(startPoint, vision, options = {}) {
  const {
    shouldOverride = false,
  } = options;

  const lightMapModel = gameState.get('lightMapModel');
  const tileMapModel = gameState.get('tileMapModel');

  // find all tiles that are with range of the path
  const nearbyPathPoints = tileMapModel.getPointsWithinPathDistance(startPoint, vision);
  nearbyPathPoints.forEach((pathPoint) => {
    // existing strength of light at this point in the path
    const existingLightLevel = lightMapModel.getTileAt(pathPoint);

    // subtract the given light level by the distance from given point to find out how bright this tile will be
    const distanceFromStart = matrixUtils.getDistanceBetween(startPoint, pathPoint);
    const calculatedLightLevel = lightLevelUtils.calculateLightLevel(distanceFromStart, vision);

    // if `shouldOverride` option is off
    //  do nothing if existing light level is already brighter
    if (!shouldOverride && lightLevelUtils.isMoreLit(existingLightLevel, calculatedLightLevel)) {
      return;
    }

    // set it!
    lightMapModel.setTileAt(pathPoint, calculatedLightLevel);
  });
}
