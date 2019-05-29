import {
  FOG_TYPES,
  isWalkableTile,
} from 'constants.shared/tileTypes';

import remoteGameState from 'state/remoteGameState';

import * as mapUtils from 'utilities.shared/mapUtils';
import * as matrixUtils from 'utilities.shared/matrixUtils';

/**
 *
 * @param {Point} endPoint
 * @returns {Boolean}
 */
export function canMyCharacterMoveTo(endPoint) {
  const mapData = remoteGameState.get('gamestate').mapData;
  const tileData = matrixUtils.getTileAt(mapData, endPoint);
  if (!isWalkableTile(tileData.tileType)) {
    return false;
  }

  const myCharacter = remoteGameState.get('myCharacter');
  const isWithinDistance = mapUtils.isWithinPathDistance(getVisibileTileMapData(), myCharacter.position, endPoint, myCharacter.movement);
  return isWithinDistance;
}
// --
/**
 * gets the Map Matrix with data as just the TileType
 *
 * @returns {Matrix}
 */
export function getTileMapData() {
  const mapData = remoteGameState.get('gamestate').mapData;
  const tileMapData = matrixUtils.map(mapData, (tileData) => (tileData.tileType));
  return tileMapData;
}
/**
 * gets the Map Matrix except placing `null` for tiles that are hidden
 *
 * @returns {Matrix}
 */
export function getVisibileTileMapData() {
  const mapData = remoteGameState.get('gamestate').mapData;
  const tileMapData = matrixUtils.map(mapData, (tileData) => {
    // hidden tiles are `null`
    if (tileData.fogType === FOG_TYPES.HIDDEN) {
      return null;
    };

    return tileData.tileType;
  });
  return tileMapData;
}
