import {LIGHT_LEVEL} from 'constants.shared/lightLevelIds';

import remoteGameState from 'state/remoteGameState';

import * as mapUtils from 'utilities.shared/mapUtils';
import * as matrixUtils from 'utilities.shared/matrixUtils';
import * as tileTypeUtils from 'utilities.shared/tileTypeUtils';

/**
 *
 * @param {Point} endPoint
 * @returns {Boolean}
 */
export function canMyCharacterMoveTo(endPoint) {
  const mapData = remoteGameState.get('mapData');
  const tileData = matrixUtils.getTileAt(mapData, endPoint);
  if (!tileTypeUtils.isWalkableTile(tileData.tileType)) {
    return false;
  }

  const myCharacter = remoteGameState.get('myCharacter');
  const isWithinDistance = mapUtils.isWithinPathDistance(getVisibileTileMapData(), myCharacter.get('position'), endPoint, myCharacter.get('movement'));
  return isWithinDistance;
}
// --
/**
 * gets the Map Matrix with data as just the TileType
 *
 * @returns {Matrix}
 */
export function getTileMapData() {
  const mapData = remoteGameState.get('mapData');
  const tileMapData = matrixUtils.map(mapData, (tileData) => (tileData.tileType));
  return tileMapData;
}
/**
 * gets the Map Matrix except placing `null` for tiles that are hidden
 *
 * @returns {Matrix}
 */
export function getVisibileTileMapData() {
  const mapData = remoteGameState.get('mapData');
  const tileMapData = matrixUtils.map(mapData, (tileData) => {
    // hidden tiles are `null`
    if (tileData.lightLevel === LIGHT_LEVEL.NONE) {
      return null;
    };

    return tileData.tileType;
  });
  return tileMapData;
}
