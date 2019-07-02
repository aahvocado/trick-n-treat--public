import Point from '@studiomoniker/point';

import * as mathUtils from 'utilities.shared/mathUtils';
import * as pointUtils from 'utilities.shared/pointUtils';

/**
 * number of Tiles vertically and horizontally
 *
 * @type {Number}
 */
export const MAP_WIDTH = 31;
export const MAP_HEIGHT = 19;
export const HALF_MAP_WIDTH = Math.floor(MAP_WIDTH / 2);
export const HALF_MAP_HEIGHT = Math.floor(MAP_HEIGHT / 2);
/**
 * randomly pick a starting Point for map gen
 *
 * @type {Point}
 */
const startX = mathUtils.getRandomInt(Math.floor(HALF_MAP_WIDTH * 0.8), Math.floor(HALF_MAP_WIDTH * 1.2));
const startY = mathUtils.getRandomInt(Math.floor(HALF_MAP_HEIGHT * 0.8), Math.floor(HALF_MAP_HEIGHT * 1.2));
export const MAP_START = pointUtils.makePointEven(new Point(startX, startY));
