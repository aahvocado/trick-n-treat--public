import test from 'ava';
import Point from '@studiomoniker/point';

import {TILE_TYPES} from 'constants.shared/tileTypes';
const {
  EMPTY,
  PATH,
} = TILE_TYPES;

import * as mapUtils from 'utilities.shared/mapUtils';

test('getAStarPath() - finds the Path from one Point to another', (t) => {
  // -- setup
  const testMatrix = [
    [PATH, PATH, PATH, PATH, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, PATH, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, PATH, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, PATH, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, PATH, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, PATH, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, PATH, PATH, PATH, PATH],
  ];

  const pointOne = new Point(3, 3);
  const pointTwo = new Point(6, 6);

  const testResult = mapUtils.getAStarPath(testMatrix, pointOne, pointTwo);
  t.is(testResult.length, 7);
});

test('isWithinPathDistance() - returns true if a distance between two Points is within given amount', (t) => {
  // -- setup
  const testMatrix = [
    [PATH, PATH, PATH, PATH, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, PATH, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, PATH, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, PATH, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, PATH, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, PATH, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, PATH, PATH, PATH, PATH],
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
    [EMPTY, EMPTY, EMPTY, PATH, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, PATH, PATH, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, PATH, PATH, PATH, EMPTY],
    [EMPTY, PATH, EMPTY, PATH, PATH, PATH, PATH],
    [EMPTY, EMPTY, PATH, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, PATH, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  ];

  const startPoint = new Point(3, 3);

  // -- test start
  const nearbyPoints = mapUtils.getPointsWithinPathDistance(testMatrix, startPoint, 3);
  // paths in the top right quadrant should be valid but bottom left not
  t.is(nearbyPoints.length, 10);
});

test('getPointOfNearestWalkableType() - finds the point of the nearest walkable Tile type', (t) => {
  // -- setup
  const testMatrix = [
    [EMPTY, EMPTY, PATH],
    [EMPTY, EMPTY, PATH],
    [EMPTY, EMPTY, PATH],
  ];

  const nearestPathPoint = mapUtils.getPointOfNearestWalkableType(testMatrix, new Point(0, 0), 3);
  t.true(nearestPathPoint.equals(new Point(2, 0)));
});

test('getValidEmptyLocations() - able to find all empty locations with a size of 1', (t) => {
  // -- setup
  const testMatrix = [
    [EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY],
  ];

  const validLocationsList = mapUtils.getValidEmptyLocations(testMatrix, 1, 1);
  t.is(validLocationsList.length, 9);
});

test('getValidEmptyLocations() - handles finding an available location with a size of 2', (t) => {
  // -- setup
  const testMatrix = [
    [EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY],
  ];

  const validLocationsList = mapUtils.getValidEmptyLocations(testMatrix, 2, 2);
  t.is(validLocationsList.length, 4);
});

test('getValidEmptyLocations() - handles finding an available location with a size of 1x3', (t) => {
  // -- setup
  const testMatrix = [
    [EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY],
  ];

  const validLocationsList = mapUtils.getValidEmptyLocations(testMatrix, 1, 3);
  t.is(validLocationsList.length, 3);
});

test('getBorderPoints() - correctly finds the border of a basic matrix', (t) => {
  // -- setup
  const testMatrix = [
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, PATH, PATH],
    [EMPTY, EMPTY, EMPTY, EMPTY, PATH, PATH, PATH],
    [EMPTY, EMPTY, PATH, PATH, PATH, PATH, PATH],
    [EMPTY, EMPTY, PATH, PATH, PATH, PATH, PATH],
    [EMPTY, PATH, PATH, PATH, PATH, PATH, PATH],
    [EMPTY, PATH, PATH, PATH, PATH, PATH, PATH],
    [EMPTY, PATH, PATH, PATH, PATH, PATH, PATH],
  ];

  const borderPointsList = mapUtils.getBorderPoints(testMatrix);
  t.is(borderPointsList.length, 19);
});
