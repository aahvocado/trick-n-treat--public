import {TILE_ID_HOUSE_LIST} from 'constants.shared/tileIds';

/**
 * @param {TileId} tile
 * @returns {Boolean}
 */
export function isWalkableTile(tile) {
  return tile % 2 === 0;
}
/**
 * @param {TileId} tile
 * @returns {Boolean}
 */
export function isWallTile(tile) {
  return tile % 2 === 1;
}
/**
 * @param {TileId} tile
 * @returns {Boolean}
 */
export function isLitTile(tile) {
  return false;
  // return LIT_TILE_ID.includes(tile);
}
/**
 * @param {TileId} tile
 * @returns {Boolean}
 */
export function isHouseTile(tile) {
  return TILE_ID_HOUSE_LIST.includes(tile);
}
/**
 * @param {TileId} tile
 * @returns {TileId}
 */
export function convertToWalkableTile(tile) {
  if (isWalkableTile(tile)) {
    return tile;
  }

  return tile - 1;
}
/**
 * @param {TileId} tile
 * @returns {TileId}
 */
export function convertToWallTile(tile) {
  if (isWallTile(tile)) {
    return tile;
  }

  return tile + 1;
}
