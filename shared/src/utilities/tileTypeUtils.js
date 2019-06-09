import {
  // TILE_TYPES,
  LIT_TILE_TYPES,
  WALKABLE_TILE_TYPES,
  WALL_TILE_TYPE_LIST,
} from 'constants.shared/tileTypes';

/**
 * @param {TileType} tileType
 * @returns {Boolean}
 */
export function isWalkableTile(tileType) {
  return WALKABLE_TILE_TYPES.includes(tileType);
}
/**
 * @param {TileType} tileType
 * @returns {Boolean}
 */
export function isLitTile(tileType) {
  return LIT_TILE_TYPES.includes(tileType);
}
/**
 * @param {TileType} tileType
 * @returns {Boolean}
 */
export function isWallTile(tileType) {
  return WALL_TILE_TYPE_LIST.includes(tileType);
}
