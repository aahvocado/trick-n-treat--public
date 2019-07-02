import Point from '@studiomoniker/point';

/**
 * @param {Grid} grid
 * @returns {Number}
 */
export function getWidth(grid) {
  return grid[0].length;
}
/**
 * @param {Grid} grid
 * @returns {Number}
 */
export function getHeight(grid) {
  return grid.length;
}
/**
 * gets the center Point of this Grid
 *
 * @param {Grid} grid
 * @returns {Point}
 */
export function getCenter(grid) {
  return new Point(
    Math.floor(getWidth(grid) / 2),
    Math.floor(getHeight(grid) / 2),
  );
}
/**
 * is X is out of bounds from the grid
 * - could be too far left or too far right
 *
 * @param {Grid} grid
 * @param {Number} x
 * @returns {Boolean}
 */
export function isXOutOfBounds(grid, x) {
  const width = getWidth(grid);
  return x < 0 || x >= width;
}
/**
 * is Y is out of bounds from the grid
 * - could be too far up or too far down
 *
 * @param {Grid} grid
 * @param {Number} y
 * @returns {Boolean}
 */
export function isYOutOfBounds(grid, y) {
  const height = getHeight(grid);
  return y < 0 || y >= height;
}
/**
 * is given point out of bounds
 *
 * @param {Grid} grid
 * @param {Point} point
 * @returns {Boolean}
 */
export function isPointOutOfBounds(grid, point) {
  return isXOutOfBounds(grid, point.x) || isYOutOfBounds(grid, point.y);
}
// -- distance methods
/**
 * gets how many tiles apart two points are
 * (only adjacently, so diagonals count as 2 tiles away)
 *
 * @param {Point} pointA
 * @param {Point} pointB
 * @returns {Number}
 */
export function getDistanceBetween(pointA, pointB) {
  const differenceX = Math.abs(pointA.x - pointB.x);
  const differenceY = Math.abs(pointA.y - pointB.y);
  return differenceX + differenceY;
}
/**
 *
 * @param {Grid} grid
 * @param {Point} pointA
 * @param {Point} pointB
 * @param {Number} distance
 * @returns {Boolean}
 */
export function isWithinDistance(grid, pointA, pointB, distance) {
  // calculate how many tiles it would take to move to the point
  const tileDistance = getDistanceBetween(pointA, pointB);
  if (tileDistance > distance) {
    return false;
  }

  return true;
}
