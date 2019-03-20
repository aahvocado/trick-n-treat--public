
/**
 * @typedef {String | Number} TileType
 */
export const TILE_TYPES = {
  START: '*',
  EMPTY: 0,
  PATH: 1,
  HOUSE: 2,
  ENCOUNTER: 4,
  SPECIAL: 9,
};
export default TILE_TYPES;

/**
 * @typedef {TileType} WalkableTileType
 * @type {Array<WalkableTileType>}
 */
export const WALKABLE_TILE_TYPES = [
  TILE_TYPES.START,
  TILE_TYPES.PATH,
  TILE_TYPES.HOUSE,
  TILE_TYPES.ENCOUNTER,
  TILE_TYPES.SPECIAL,
];
/**
 * @param {TileType} tileType
 * @returns {Boolean}
 */
export function isWalkableTile(tileType) {
  return WALKABLE_TILE_TYPES.includes(tileType);
}
/**
 * @typedef {String | Number} FogType
 */
export const FOG_TYPES = {
  HIDDEN: 0,
  VISIBLE: 1,
  PARTIAL: 2,
};
