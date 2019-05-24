import Point from '@studiomoniker/point';

import * as mathUtils from 'utilities.shared/mathUtils';

/**
 * number of Tiles vertically and horizontally
 *
 * @type {Number}
 */
export const MAP_WIDTH = 27;
export const MAP_HEIGHT = 33;
export const HALF_MAP_WIDTH = Math.floor(MAP_WIDTH / 2);
export const HALF_MAP_HEIGHT = Math.floor(MAP_HEIGHT / 2);
/**
 * randomly pick a starting Point for map gen
 *
 * @type {Point}
 */
const startX = mathUtils.getRandomIntInclusive(Math.floor(HALF_MAP_WIDTH * 0.8), Math.floor(HALF_MAP_WIDTH * 1.2));
const startY = mathUtils.getRandomIntInclusive(Math.floor(HALF_MAP_HEIGHT * 0.8), Math.floor(HALF_MAP_HEIGHT * 1.2));
export const MAP_START = new Point(startX, startY);
