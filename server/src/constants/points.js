import Point from '@studiomoniker/point';

export const LEFT_POINT = new Point(-1, 0);
export const RIGHT_POINT = new Point(1, 0);
export const UP_POINT = new Point(0, -1);
export const DOWN_POINT = new Point(0, 1);

export const POINTS = {
  LEFT: LEFT_POINT,
  RIGHT: RIGHT_POINT,
  UP: UP_POINT,
  DOWN: DOWN_POINT,
};

/**
 * gives a point based on a string direction
 *
 * @param {String} directionName
 * @returns {Point}
 */
export function getPointFromString(directionName) {
  switch (directionName) {
    case 'left':
      return POINTS.LEFT;
    case 'right':
      return POINTS.RIGHT;
    case 'up':
      return POINTS.UP;
    case 'down':
      return POINTS.DOWN;
  }
}

/**
 * picks a random Adjacent directional Point
 *
 * @returns {Point}
 */
export function getRandomDirection() {
  const direction = mathUtils.getRandomIntInclusive(0, 3);
  switch (direction) {
    // left
    case 0:
      return POINTS.LEFT;
    // right
    case 1:
      return POINTS.RIGHT;
    // up
    case 2:
      return POINTS.UP;
    // down
    case 3:
      return POINTS.DOWN;
  }
}
