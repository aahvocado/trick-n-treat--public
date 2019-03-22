import {isWalkableTile} from 'constants/tileTypes';

import remoteAppState from 'data/remoteAppState';

import * as matrixUtils from 'utilities/matrixUtils.remote';

/**
 *
 * @param {Matrix} matrix
 * @param {Point} pointA
 * @param {Point} pointB
 * @param {Number} distance
 * @returns {Boolean}
 */
export function canMoveTo(matrix, pointA, pointB, distance) {
  // technically, you can not move to the same position
  const isSamePosition = pointA.x === pointB.x && pointA.y === pointB.y;
  if (isSamePosition) {
    return false;
  }

  // check if tile is even walkable
  const tile = matrix[pointB.y][pointB.x];
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
