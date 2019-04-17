/** @type {Number} */
export const TILE_SIZE = 50;
/** @type {Number} */
const HALF_TILE_SIZE = TILE_SIZE / 2;

/** @type {Number} */
export const MAP_CONTAINER_WIDTH = 300;
/** @type {Number} */
const HALF_MAP_CONTAINER_WIDTH = MAP_CONTAINER_WIDTH / 2;

/** @type {Number} */
export const MAP_CONTAINER_HEIGHT = 350;
/** @type {Number} */
const HALF_MAP_CONTAINER_HEIGHT = MAP_CONTAINER_HEIGHT / 2;

/**
 * @type {Function}
 * @param {Number} x
 * @returns {Number}
 */
export function calculateMapXOffset(x) {
  const baseOffsetX = (TILE_SIZE * x) - HALF_MAP_CONTAINER_WIDTH + HALF_TILE_SIZE;
  return baseOffsetX * -1;
}
/**
 * @type {Function}
 * @param {Number} y
 * @returns {Number}
 */
export function calculateMapYOffset(y) {
  const baseOffsetY = (TILE_SIZE * y) - HALF_MAP_CONTAINER_HEIGHT + HALF_TILE_SIZE;
  return baseOffsetY * -1;
}

/*
1x = (-112.5px, -187.5px)
1.5x = (-72.5px, -140.5px) ... 64.44%, 73.333333%
2x = (-37.5px, -150.5px) ... 33.33%, 80.2%
*/
