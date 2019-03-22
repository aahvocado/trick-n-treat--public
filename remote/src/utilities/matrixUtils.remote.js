/**
 * gets how many tiles apart two points are
 * (only adjacently, so diagonals count as 2 tiles away)
 *
 * @param {Matrix} matrix
 * @param {Point} pointA
 * @param {Point} pointB
 * @returns {Number}
 */
export function getDistanceBetween(matrix, pointA, pointB) {
  const xDistance = Math.abs(pointB.x - pointA.x);
  const yDistance = Math.abs(pointB.y - pointA.y);
  return xDistance + yDistance;
}
/**
 *
 * @param {Matrix} matrix
 * @param {Point} pointA
 * @param {Point} pointB
 * @param {Number} distance
 * @returns {Boolean}
 */
export function isWithinDistance(matrix, pointA, pointB, distance) {
  // calculate how many tiles it would take to move to the point
  const tileDistance = getDistanceBetween(matrix, pointA, pointB);
  if (tileDistance > distance) {
    return false;
  }

  return true;
}
