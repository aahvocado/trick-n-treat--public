import gameState from 'data/gameState';

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
 * formats Gamestate into something more convenient for the Remote
 *
 * @returns {GamestateObject}
 */
export function getFormattedGamestateData() {
  const formattedMapData = getFormattedMapData();

  return {
    mapData: formattedMapData,
    mode: gameState.get('mode'),
    round: gameState.get('round'),
  };
}
/**
 * formats TileMapModel and the entities on the map into something more convenient
 *
 * @typedef {Object} TileData
 * @property {Point} TileData.position - {x, y}
 * @property {Number} TileData.tileType
 * @property {Array<CharacterModel.export>} TileData.charactersHere
 * @property {HouseModel.export} TileData.houseHere
 * @property {EncounterModel.export} TileData.encounterHere
 *
 * @returns {Matrix<TileData>}
 */
export function getFormattedMapData() {
  const tileMapModel = gameState.get('tileMapModel');
  const fogMapModel = gameState.get('fogMapModel');

  const formattedMapData = tileMapModel.map((tileData, tilePoint) => {
    const charactersHere = gameState.getCharactersAt(tilePoint).map((character) => (character.export()));
    const houseHere = gameState.findHouseAt(tilePoint);
    const encounterHere = gameState.findEncounterAt(tilePoint);

    return {
      position: tilePoint,
      tileType: tileData,
      fogType: fogMapModel.getTileAt(tilePoint),
      charactersHere: charactersHere,
      houseHere: houseHere && houseHere.export(),
      encounterHere: encounterHere && encounterHere.export(),
    };
  });

  return formattedMapData;
}
