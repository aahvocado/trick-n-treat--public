import Point from '@studiomoniker/point';

import {isWalkableTile} from 'constants/tileTypes';

import remoteAppState from 'data/remoteAppState';

import * as matrixUtils from 'utilities/matrixUtils.remote';

/**
 *
 * @param {Matrix} matrix
 * @param {Point} pointA - start
 * @param {Point} pointB - destination
 * @param {Number} distance
 * @returns {Boolean}
 */
export function canMoveTo(matrix, _pointA, _pointB, distance) {
  const pointA = new Point(_pointA.x, _pointA.y);
  const pointB = new Point(_pointB.x, _pointB.y);

  // technically, you can not move to the same position
  const isSamePosition = pointA.equals(pointB);
  if (isSamePosition) {
    return false;
  }

  // check if tile is even walkable
  const tile = matrixUtils.getTileAt(matrix, pointB);;
  if (!isWalkableTile(tile)) {
    return false;
  }

  // check if tile is within distance
  const isWithinDistance = matrixUtils.isWithinDistance(matrix, pointA, pointB, distance);
  return isWithinDistance;
}
/**
 *
 * @param {Point} point
 * @returns {Boolean}
 */
export function canMyCharacterMoveTo(point) {
  const myCharacter = remoteAppState.get('myCharacter');
  const mapMatrix = remoteAppState.get('gamestate').tileMapModel.matrix;
  return canMoveTo(mapMatrix, myCharacter.position, point, myCharacter.movement);
}
/**
 *
 * @returns {Boolean}
 */
export function canMyUserTrick() {
  const myUser = remoteAppState.get('myUser');
  return myUser.canTrick;
}
/**
 *
 * @returns {Boolean}
 */
export function canMyUserTreat() {
  const myUser = remoteAppState.get('myUser');
  return myUser.canTreat;
}
