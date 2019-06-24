import {GAME_MODE} from 'constants.shared/gameModes';

import gameState from 'state/gameState';

// import logger from 'utilities/logger.game';

/**
 * this Helper should try to organize the data (to be fleshed out later)
 */

/**
 * @param {CharacterModel} characterModel
 * @returns {Boolean}
 */
export function canCharacterDoStuff(characterModel) {
  // can't do anything if game is not active, or if it is currently working
  if (!gameState.get('isActive') || gameState.get('mode') === GAME_MODE.WORKING) {
    return false;
  }

  // not if it is not the character's turn
  const isActive = characterModel.get('isActive');
  if (!isActive) {
    return false;
  }

  // ok
  return true;
}
/**
 * formats `mapGridModel` and the entities on the map into something more convenient
 *
 * @returns {Grid<TileData>}
 */
export function getFormattedMapData() {
  const mapGridModel = gameState.get('mapGridModel');
  const lightingModel = gameState.get('lightingModel');
  if (mapGridModel === undefined) {
    return;
  }

  const formattedMapData = mapGridModel.map((cell) => {
    const cellPoint = cell.get('point');
    const charactersHere = gameState.getCharactersAt(cellPoint).map((character) => (character.export()));
    const encounterHere = gameState.findEncounterAt(cellPoint);

    return {
      point: cellPoint,
      tile: cell.get('tile'),
      lightLevel: lightingModel.getAt(cellPoint).get('tile'),
      charactersHere: charactersHere,
      encounterHere: encounterHere && encounterHere.export(),
    };
  });

  return formattedMapData;
}
