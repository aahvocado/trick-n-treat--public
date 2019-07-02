import {
  TILE_ID_HOUSE_LIST,
  TILE_NUM_TO_STRING_MAP,
  TILE_STRING_TO_NUM_MAP,
} from 'constants.shared/tileIds';

/**
 * @param {TileId} tileId
 * @returns {TileNum}
 */
export function getTileNum(tileId) {
  return TILE_STRING_TO_NUM_MAP[tileId];
}
/**
 * @param {TileNum} tileNum
 * @returns {TileId}
 */
export function getTileId(tileNum) {
  return TILE_NUM_TO_STRING_MAP[tileNum];
}
/**
 * @param {TileId} tile
 * @returns {Boolean}
 */
export function isWalkableTile(tile) {
  const tileNum = getTileNum(tile);
  return tileNum % 2 === 0;
}
/**
 * @param {TileId} tile
 * @returns {Boolean}
 */
export function isWallTile(tile) {
  const tileNum = getTileNum(tile);
  return tileNum % 2 === 1;
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

  // console.log('convertToWalkableTile', tile);
  // console.log('getTileNum', getTileNum(tile));
  const tileNum = getTileNum(tile);
  return getTileId(tileNum - 1);
}
/**
 * @param {TileId} tile
 * @returns {TileId}
 */
export function convertToWallTile(tile) {
  if (isWallTile(tile)) {
    return tile;
  }

  const tileNum = getTileNum(tile);
  return getTileId(tileNum + 1);
}
