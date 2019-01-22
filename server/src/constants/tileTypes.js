
/**
 * @typedef {String | Number} TileType
 */
export const TILE_TYPES = {
  START: '*',
  EMPTY: 0,
  PATH: 1,
  HOUSE: 2,
  SPECIAL: 3,
}
export default TILE_TYPES;

export const WALKABLE_TILE_TYPES = [
  TILE_TYPES.START,
  TILE_TYPES.PATH,
  TILE_TYPES.HOUSE,
  TILE_TYPES.SPECIAL,
]
/**
 * todo: Array.includes() is actually kinda slow and expensive
 *
 * @param {TileType} tileType
 */
export function isWalkableTile(tileType) {
  return WALKABLE_TILE_TYPES.includes(tileType);
}

