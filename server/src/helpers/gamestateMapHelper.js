import array2d from 'array2d';

import * as gamestateGenerationHelper from 'helpers/gamestateGenerationHelper';

import gameState from 'state/gameState';

import * as lightLevelUtils from 'utilities.shared/lightLevelUtils';
import * as tileUtils from 'utilities.shared/tileUtils';

/**
 * helper for Gamestate specific Map functions
 */

// -- Map
/**
 * determines if there is are any Encounter within path distance
 *
 * @param {Point} point
 * @param {Number} [distance]
 * @returns {Boolean}
 */
export function isWalkableAt(point) {
  return !isWallAt(point);
}
/**
 * determines if there is a wall at the point
 *
 * @param {Point} point
 * @param {Number} [distance]
 * @returns {Boolean}
 */
export function isWallAt(point) {
  const mapGridModel = gameState.get('mapGridModel');
  const cell = mapGridModel.getAt(point);
  return tileUtils.isWallTile(cell.get('tile'));
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
  const mapGridModel = gameState.get('mapGridModel');

  return encounterList.some((encounterModel) => {
    const encounterLocation = encounterModel.get('location');
    return mapGridModel.distance(startPoint, encounterLocation) <= distance;
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
  const mapGridModel = gameState.get('mapGridModel');

  return encounterList.filter((encounterModel) => {
    const encounterLocation = encounterModel.get('location');
    return mapGridModel.distance(startPoint, encounterLocation) <= distance;
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
  const mapGridModel = gameState.get('mapGridModel');

  // go through all the Encounters
  const visibleEncounters = encounterList.filter((encounterModel, idx) => {
    const encounterLocation = encounterModel.get('location');

    // check if any of the Characters can see this Encounter
    const isVisibleToAnyCharacter = characterList.some((characterModel) => {
      const characterLocation = characterModel.get('position');
      const characterRange = characterModel.get('movementBase');
      return mapGridModel.distance(encounterLocation, characterLocation) <= characterRange;
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

  const lightingModel = gameState.get('lightingModel');
  const mapGridModel = gameState.get('mapGridModel');

  // find all tiles a certain distance away
  const surroundingCells = mapGridModel.cropAround(startPoint, vision, vision);
  array2d.eachCell(surroundingCells, (cell) => {
    if (cell === undefined) {
      return;
    }

    const cellPoint = cell.get('point');
    const lightingCell = lightingModel.getAt(cellPoint);
    const existingLightLevel = lightingCell.get('tile');

    // > update wall lighting differently
    if (tileUtils.isWallTile(cell.get('tile'))) {
      const wallDistance = mapGridModel.distance(startPoint, cellPoint);

      // immediately adjacent walls can just be lit
      const calculatedWallLightLevel = wallDistance <= 1 ? 6 : Math.floor(2 / wallDistance);
      if (!shouldOverride && lightLevelUtils.isMoreLit(existingLightLevel, calculatedWallLightLevel)) {
        return;
      }

      // farther walls should fall off a lot quicker
      lightingCell.set({tile: calculatedWallLightLevel});
      return;
    }

    // > regular tiles
    // find how far the point is on the path
    const path = mapGridModel.findPath(startPoint, cellPoint);
    if (path.length <= -1) {
      return;
    }

    // subtract the given light level by the distance from given point to find out how bright this tile will be
    const calculatedLightLevel = lightLevelUtils.calculateLightLevel(path.length, vision);

    // if `shouldOverride` option is off, do nothing if existing light level is already brighter
    if (!shouldOverride && lightLevelUtils.isMoreLit(existingLightLevel, calculatedLightLevel)) {
      return;
    }

    // update it
    // lightingModel.setAt(cellPoint, calculatedLightLevel);
    lightingCell.set({tile: calculatedLightLevel});
    onUpdateTileLighting(cellPoint, calculatedLightLevel, existingLightLevel);
  });
}
/**
 * see if we need to do anything when a tile's lighting gets updated
 *
 * @param {Point} point
 * @param {LightLevel} newLightLevel
 * @param {LightLevel} oldLightLevel
 */
export function onUpdateTileLighting(point, newLightLevel, oldLightLevel) {
  // still hidden
  if (lightLevelUtils.isMostlyHidden(newLightLevel)) {
    return;
  }

  // don't do anything if the old light level was already mostly visible
  if (lightLevelUtils.isMostlyVisible(oldLightLevel)) {
    return;
  }

  // if there is a House tile at that point, generate a house encounter
  const mapGridModel = gameState.get('mapGridModel');
  const mapCell = mapGridModel.getAt(point);
  if (tileUtils.isHouseTile(mapCell.get('tile'))) {
    gamestateGenerationHelper.placeHouse(mapGridModel, point);
  }

  // too close to an existing encounter
  if (gameState.isNearEncounterAt(point, 1)) {
    return;
  }

  // randomly determine chance to generate an encounter
  const encounterChance = Math.random();
  if (encounterChance <= 0.6) {
    return;
  }

  // success - ask generation helper to make an encounter
  gamestateGenerationHelper.placeEncounter(mapGridModel, point);
}
