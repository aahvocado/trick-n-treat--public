/** @type {Number} */
export const TILE_SIZE = 50;
/** @type {Number} */
export const MAP_WIDTH = TILE_SIZE * 6;
/** @type {Number} */
export const MAP_HEIGHT = TILE_SIZE * 7;
/**
 * @type {Function}
 * @param {Number} x
 * @returns {Number}
 */
export function calculateMapXOffset(x) {
  return TILE_SIZE * x - MAP_WIDTH / 2 + TILE_SIZE / 2;
}
/**
 * @type {Function}
 * @param {Number} y
 * @returns {Number}
 */
export function calculateMapYOffset(y) {
  return TILE_SIZE * y - MAP_HEIGHT / 2 + TILE_SIZE / 2;
}
