/**
 * @typedef {Number} TileType
 */
export const TILE_TYPES = {
  EMPTY: 0,

  // walkable tiles
  DEBUG: 1,
  LIT_DEBUG: 2,

  CONNECTOR: 3,
  LIT_CONNECTOR: 4,

  SIDEWALK: 5,
  LIT_SIDEWALK: 6,

  ROAD: 7,
  LIT_ROAD: 8,

  SWAMP: 9,
  LIT_SWAMP: 10,

  PLANKS: 11,
  PLANKS_TWO: 12,

  WOODS: 13,
  LIT_WOODS: 14,
  WOODS_TWO: 15,
  LIT_WOODS_TWO: 16,

  // unwalkable tiles
  WATER: 30,
  LIT_WATER: 31,

  DIRTY_WATER: 32,
  LIT_DIRTY_WATER: 33,

  FOREST: 34,
  LIT_FOREST: 35,
  FOREST_TWO: 36,
  LIT_FOREST_TWO: 37,

  GRASS: 38,
  LIT_GRASS: 39,

  PATH: 40, // (dirt)
  LIT_PATH: 41,

  // ?
  HOUSE: 51,
  ENCOUNTER: 52,
  SPECIAL: 53,

  // decorations
  BUSH: 81,

  TREE_ONE: 82,
  TREE_TWO: 83,
  TREE_THREE: 84,

  SPOOKY_TREE_ONE: 85,
  SPOOKY_TREE_TWO: 86,
  SPOOKY_TREE_THREE: 87,

  LAMPPOST_ONE: 88,
  LAMPPOST_TWO: 89,

  GRAVE_ONE: 90,
  GRAVE_TWO: 91,
};
/**
 * this is the reverse of the above Key/Value map,
 *  don't depend on this
 * @example { 0: 'EMPTY', 1: 'PATH' }
 */
export const TILE_TYPES_NAME = (() => {
  const result = {};
  Object.keys(TILE_TYPES).forEach((key) => {
    result[TILE_TYPES[key]] = key;
  });
  return result;
})();
/**
 * @typedef {TileType} WalkableTileType
 * @type {Array<WalkableTileType>}
 */
export const WALKABLE_TILE_TYPES = [
  TILE_TYPES.DEBUG,
  TILE_TYPES.LIT_DEBUG,
  TILE_TYPES.DEBUG,
  TILE_TYPES.LIT_DEBUG,

  TILE_TYPES.SIDEWALK,
  TILE_TYPES.LIT_SIDEWALK,
  TILE_TYPES.ROAD,
  TILE_TYPES.LIT_ROAD,
  TILE_TYPES.SWAMP,
  TILE_TYPES.LIT_SWAMP,
  TILE_TYPES.PLANKS,
  TILE_TYPES.PLANKS_TWO,
  TILE_TYPES.WOODS,
  TILE_TYPES.LIT_WOODS,
  TILE_TYPES.WOODS_TWO,
  TILE_TYPES.LIT_WOODS_TWO,
  TILE_TYPES.GRASS,
  TILE_TYPES.LIT_GRASS,
  TILE_TYPES.PATH,
  TILE_TYPES.LIT_PATH,

  TILE_TYPES.HOUSE,
  TILE_TYPES.ENCOUNTER,
  TILE_TYPES.SPECIAL,
];
/**
 * @typedef {TileType} WalkableTileType
 * @type {Array<WalkableTileType>}
 */
export const LIT_TILE_TYPES = [
  TILE_TYPES.LIT_DEBUG,
  TILE_TYPES.LIT_CONNECTOR,

  TILE_TYPES.LIT_PATH,
  TILE_TYPES.LIT_GRASS,
  TILE_TYPES.LIT_SIDEWALK,
  TILE_TYPES.LIT_ROAD,
  TILE_TYPES.LIT_SWAMP,
  TILE_TYPES.LIT_WOODS,
  TILE_TYPES.LIT_WOODS_TWO,

  TILE_TYPES.LAMPPOST_ONE,
  TILE_TYPES.LAMPPOST_TWO,
];
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
 * @typedef {Number} FogType
 */
export const FOG_TYPES = {
  HIDDEN: 0,
  DIMMEST: 1,
  DIMMER: 2,
  DIM: 3,
  VISIBLE: 4,
};
/**
 * @param {FogType} fogType
 * @returns {Boolean}
 */
export function isPartiallyVisibleFog(fogType) {
  return [FOG_TYPES.DIM, FOG_TYPES.DIMMER, FOG_TYPES.DIMMEST].includes(fogType);
}
/**
 * @param {FogType} fogTypeA
 * @param {FogType} fogTypeB
 * @returns {Boolean}
 */
export function isMoreLit(fogTypeA, fogTypeB) {
  return fogTypeA > fogTypeB;
}
/**
 * @param {FogType} fogTypeA
 * @param {FogType} fogTypeB
 * @returns {Boolean}
 */
export function isLessLit(fogTypeA, fogTypeB) {
  return fogTypeA < fogTypeB;
}
