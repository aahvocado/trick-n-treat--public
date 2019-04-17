import test from 'ava';
import Point from '@studiomoniker/point';

import {TILE_TYPES} from 'constants/tileTypes';
const NOPE = TILE_TYPES.EMPTY;
const PATH = TILE_TYPES.PATH;

import * as mapUtils from 'utilities/mapUtils';

test('getAStarPath() - finds the Path from one Point to another', (t) => {
  // -- setup
  const testMatrix = [
    [PATH, PATH, PATH, PATH, NOPE, NOPE, NOPE],
    [NOPE, NOPE, NOPE, PATH, NOPE, NOPE, NOPE],
    [NOPE, NOPE, NOPE, PATH, NOPE, NOPE, NOPE],
    [NOPE, NOPE, NOPE, PATH, NOPE, NOPE, NOPE],
    [NOPE, NOPE, NOPE, PATH, NOPE, NOPE, NOPE],
    [NOPE, NOPE, NOPE, PATH, NOPE, NOPE, NOPE],
    [NOPE, NOPE, NOPE, PATH, PATH, PATH, PATH],
  ];

  const pointOne = new Point(3, 3);
  const pointTwo = new Point(6, 6);

  const testResult = mapUtils.getAStarPath(testMatrix, pointOne, pointTwo);
  t.is(testResult.length, 7);
});

test('isWithinPathDistance() - returns true if a distance between two Points is within given amount', (t) => {
  // -- setup
  const testMatrix = [
    [PATH, PATH, PATH, PATH, NOPE, NOPE, NOPE],
    [NOPE, NOPE, NOPE, PATH, NOPE, NOPE, NOPE],
    [NOPE, NOPE, NOPE, PATH, NOPE, NOPE, NOPE],
    [NOPE, NOPE, NOPE, PATH, NOPE, NOPE, NOPE],
    [NOPE, NOPE, NOPE, PATH, NOPE, NOPE, NOPE],
    [NOPE, NOPE, NOPE, PATH, NOPE, NOPE, NOPE],
    [NOPE, NOPE, NOPE, PATH, PATH, PATH, PATH],
  ];

  const pointOne = new Point(3, 3);
  const pointTwo = new Point(6, 6);

  // -- test start
  t.false(mapUtils.isWithinPathDistance(testMatrix, pointOne, pointTwo, 5));
  t.true(mapUtils.isWithinPathDistance(testMatrix, pointOne, pointTwo, 7));
});

test('getPointsWithinPathDistance() - finds walkable points within a given distance', (t) => {
  // -- setup
  const testMatrix = [
    [NOPE, NOPE, NOPE, PATH, NOPE, NOPE, NOPE],
    [NOPE, NOPE, NOPE, PATH, PATH, NOPE, NOPE],
    [NOPE, NOPE, NOPE, PATH, PATH, PATH, NOPE],
    [NOPE, PATH, NOPE, PATH, PATH, PATH, PATH],
    [NOPE, NOPE, PATH, NOPE, NOPE, NOPE, NOPE],
    [NOPE, NOPE, NOPE, PATH, NOPE, NOPE, NOPE],
    [NOPE, NOPE, NOPE, NOPE, NOPE, NOPE, NOPE],
  ];

  const startPoint = new Point(3, 3);

  // -- test start
  const nearbyPoints = mapUtils.getPointsWithinPathDistance(testMatrix, startPoint, 3);
  // paths in the top right quadrant should be valid but bottom left not
  t.is(nearbyPoints.length, 10);
});
