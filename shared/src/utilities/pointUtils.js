// import Point from '@studiomoniker/point';

import {POINTS} from 'constants.shared/points';

import * as mathUtils from 'utilities.shared/mathUtils';

/**
 * gives a point based on a string direction
 *
 * @param {String} directionName
 * @returns {Point}
 */
export function getPointFromString(directionName) {
  switch (directionName) {
    case 'left':
      return POINTS.LEFT.clone();
    case 'right':
      return POINTS.RIGHT.clone();
    case 'up':
      return POINTS.UP.clone();
    case 'down':
      return POINTS.DOWN.clone();
  }
}
/**
 * picks a random Adjacent directional Point
 *
 * @returns {Point}
 */
export function getRandomDirectionPoint() {
  const direction = mathUtils.getRandomInt(0, 3);
  switch (direction) {
    // left
    case 0:
      return POINTS.LEFT.clone();
    // right
    case 1:
      return POINTS.RIGHT.clone();
    // up
    case 2:
      return POINTS.UP.clone();
    // down
    case 3:
      return POINTS.DOWN.clone();
  }
}
/**
 * @param {Point} point
 * @param {Number} [distance]
 * @returns {Point}
 */
export function createPointLeft(point, distance = 1) {
  const extendedPoint = POINTS.LEFT.clone().multiplyNum(distance);
  return point.clone().add(extendedPoint);
}
/**
 * @param {Point} point
 * @param {Number} [distance]
 * @returns {Point}
 */
export function createPointRight(point, distance = 1) {
  const extendedPoint = POINTS.RIGHT.clone().multiplyNum(distance);
  return point.clone().add(extendedPoint);
}
/**
 * @param {Point} point
 * @param {Number} [distance]
 * @returns {Point}
 */
export function createPointAbove(point, distance = 1) {
  const extendedPoint = POINTS.UP.clone().multiplyNum(distance);
  return point.clone().add(extendedPoint);
}
/**
 * @param {Point} point
 * @param {Number} [distance]
 * @returns {Point}
 */
export function createPointBelow(point, distance = 1) {
  const extendedPoint = POINTS.DOWN.clone().multiplyNum(distance);
  return point.clone().add(extendedPoint);
}
/**
 * @param {Point} point
 * @returns {Point}
 */
export function makePointEven(point) {
  const pointCopy = point.clone();

  if (pointCopy.x % 2 === 1) {
    pointCopy.x += 1;
  }
  if (pointCopy.y % 2 === 1) {
    pointCopy.y += 1;
  }

  return pointCopy;
}
/**
 * @param {Point} point
 * @returns {Point}
 */
export function makePointOdd(point) {
  const pointCopy = point.clone();

  if (pointCopy.x % 2 === 0) {
    pointCopy.x += 1;
  }
  if (pointCopy.y % 2 === 0) {
    pointCopy.y += 1;
  }

  return pointCopy;
}
/*
  Please note for these directional checking utilities are a little bit weird
   because we ascend starting from the top-left and go to the bottom-right
 */
/**
 * @param {Point} pointA
 * @param {Point} pointB
 * @returns {Boolean}
 */
export function isPointLeft(pointA, pointB) {
  return pointA.x < pointB.x;
}
/**
 * @param {Point} pointA
 * @param {Point} pointB
 * @returns {Boolean}
 */
export function isPointRight(pointA, pointB) {
  return pointA.x > pointB.x;
}
/**
 * @param {Point} pointA
 * @param {Point} pointB
 * @returns {Boolean}
 */
export function isPointAbove(pointA, pointB) {
  return pointA.y < pointB.y;
}
/**
 * @param {Point} pointA
 * @param {Point} pointB
 * @returns {Boolean}
 */
export function isPointBelow(pointA, pointB) {
  return pointA.y > pointB.y;
}
