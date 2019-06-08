import gameState from 'state/gameState';

import logger from 'utilities/logger.game';

/**
 * this Helper should try to organize the data (to be fleshed out later)
 */

/**
 * logs the current order of turns
 */
export function displayTurnQueue() {
  let displayList = '';

  const turnQueue = gameState.get('turnQueue');
  for (let i = 0; i < turnQueue.length; i++) {
    const characterModel = turnQueue[i];
    displayList += `\n${i + 1}. "${characterModel.get('name')}"`;
  }

  logger.game('Turn Order' + displayList);
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
