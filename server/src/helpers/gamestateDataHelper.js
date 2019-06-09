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
 * formats TileMapModel and the entities on the map into something more convenient
 *
 * @typedef {Object} TileData
 * @property {Point} TileData.position - {x, y}
 * @property {Number} TileData.tileType
 * @property {Array<CharacterModel.export>} TileData.charactersHere
 * @property {EncounterModel.export} TileData.encounterHere
 *
 * @returns {Matrix<TileData>}
 */
export function getFormattedMapData() {
  const tileMapModel = gameState.get('tileMapModel');
  const lightMapModel = gameState.get('lightMapModel');
  if (tileMapModel === undefined) {
    return;
  }

  const formattedMapData = tileMapModel.map((tileData, tilePoint) => {
    const charactersHere = gameState.getCharactersAt(tilePoint).map((character) => (character.export()));
    const encounterHere = gameState.findEncounterAt(tilePoint);

    return {
      position: tilePoint,
      tileType: tileData,
      lightLevel: lightMapModel.getTileAt(tilePoint),
      charactersHere: charactersHere,
      encounterHere: encounterHere && encounterHere.export(),
    };
  });

  return formattedMapData;
}
