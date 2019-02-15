import test from 'ava';
import * as matrixUtils from 'utilities/matrixUtils';

import Point from '@studiomoniker/point';

test('forEach() - properly executes callback for each tile', (t) => {
  let tileCount = 0;

  const testMatrix = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];

  matrixUtils.forEach(testMatrix, () => {
    tileCount += 1;
  })

  t.is(tileCount, 9);
})

test('createMatrix() - creates a perfect square matrix', (t) => {
  const expectedMatrix = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];

  const createdMatrix = matrixUtils.createMatrix(3, 3, 0);

  t.is(Array.toString(createdMatrix), Array.toString(expectedMatrix));
})

test('createMatrix() - creates taller matrix', (t) => {
  const expectedMatrix = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];

  const createdMatrix = matrixUtils.createMatrix(3, 6, 0);

  t.is(Array.toString(createdMatrix), Array.toString(expectedMatrix));
})

test('createMatrix() - creates wider matrix', (t) => {
  const expectedMatrix = [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
  ];

  const createdMatrix = matrixUtils.createMatrix(6, 3, 0);

  t.is(Array.toString(createdMatrix), Array.toString(expectedMatrix));
})

test('getSubmatrixSquare() - returns a submatrix with two locations creating a 2x2 square', (t) => {
  const testMatrix = [
    [0, 0, 0, 0, 0],
    [0, '*', 1, 0, 0],
    [0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ];

  const expectedMatrix = [
    ['*', 1],
    [1, 1],
  ];

  const submatrix = matrixUtils.getSubmatrixSquare(testMatrix, 1, 1, 2, 2);
  t.is(Array.toString(submatrix), Array.toString(expectedMatrix));
})

test('hasNearbyTileType() - returns false if tile is not nearby, using a distance of 1', (t) => {
  const testMatrix = [
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0],
    [0, 0, '*', 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ];
  const point = new Point(2, 2);

  const isNearby = matrixUtils.hasNearbyTileType(testMatrix, point, 1, 1);
  t.false(isNearby);
})

test('hasNearbyTileType() - returns true if tile is nearby, using a distance of 2', (t) => {
  const testMatrix = [
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0],
    [0, 0, '*', 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ];
  const point = new Point(2, 2);

  const isNearby = matrixUtils.hasNearbyTileType(testMatrix, point, 1, 2);
  t.true(isNearby);
})

test('containsTileType() - returns true if any of the tiles match given type', (t) => {
  const testMatrix = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 2],
  ];

  const hasTile = matrixUtils.containsTileType(testMatrix, 2);
  t.true(hasTile);
})

test('containsTileType() - returns false if none of the tiles match given type', (t) => {
  const testMatrix = [
    [1, 0, 0, 0, 5],
    [0, 2, 0, 4, 0],
    [0, 0, 3, 0, 0],
    [0, 2, 0, 4, 0],
    [1, 0, 0, 0, 5],
  ];

  const hasTile = matrixUtils.containsTileType(testMatrix, 6);
  t.false(hasTile);
})

test('hasAdjacentTileType() - returns true if any of tiles directly adjacent match given type', (t) => {
  const testMatrix = [
    [0, 0, 0, 0, 0],
    [0, 0, 2, 0, 0],
    [0, 0, '*', 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ];
  const point = new Point(2, 2);

  const hasTile = matrixUtils.hasAdjacentTileType(testMatrix, point, 2);
  t.true(hasTile);
})

test('hasAdjacentTileType() - returns false if no tiles directly adjacent match given type', (t) => {
  const testMatrix = [
    [0, 0, 0, 0, 0],
    [0, 2, 0, 2, 0],
    [0, 0, '*', 0, 0],
    [0, 2, 0, 2, 0],
    [0, 0, 0, 0, 0],
  ];
  const point = new Point(2, 2);

  const hasTile = matrixUtils.hasAdjacentTileType(testMatrix, point, 2);
  t.false(hasTile);
})

test('getTypeCounts() - returns typeCount with appropriate types', (t) => {
  const testMatrix = [
    [0, 0, 0],
    [1, 1, 1],
    [2, 2, 2],
  ];

  const expectedCounts = {
    0: 3,
    1: 3,
    2: 3,
  }

  const typeCountMap = matrixUtils.getTypeCounts(testMatrix);
  t.deepEqual(typeCountMap, expectedCounts);
})

test('getTypeCounts() - ignores `undefined` and `null`', (t) => {
  const testMatrix = [
    [0, 0, 0],
    [1, 1, 1],
    [2, 2, 2],
    [undefined, null, undefined],
  ];

  const expectedCounts = {
    0: 3,
    1: 3,
    2: 3,
  }

  const typeCountMap = matrixUtils.getTypeCounts(testMatrix);
  t.deepEqual(typeCountMap, expectedCounts);
})

test('getTypeCounts() - handles strings and numbers', (t) => {
  const testMatrix = [
    [0, 1, 2, 3],
    ['4', '5', '6', '7'],
    ['one', 'two', 'three', 'four'],
    ['five', 'six', 'undefined', 'null'],
  ];

  const expectedCounts = {
    0: 1,
    1: 1,
    2: 1,
    3: 1,
    '4': 1,
    '5': 1,
    '6': 1,
    '7': 1,
    one: 1,
    two: 1,
    three: 1,
    four: 1,
    five: 1,
    six: 1,
    'undefined': 1,
    'null': 1,
  }

  const typeCountMap = matrixUtils.getTypeCounts(testMatrix);
  t.deepEqual(typeCountMap, expectedCounts);
})

test('getCount() - returns correct count', (t) => {
  const testMatrix = [
    [0, 0, 0],
    [1, 1, 1],
    [2, 2, 2],
  ];

  const typeCount = matrixUtils.getCount(testMatrix, 0);
  t.is(typeCount, 3);
})

test('getCount() - returns a count 0 if there are no count', (t) => {
  const testMatrix = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];

  const typeCount = matrixUtils.getCount(testMatrix, 1);
  t.is(typeCount, 0);
})

test('getCount() - can find undefined (and handle null)', (t) => {
  const testMatrix = [
    [undefined, undefined, undefined],
    [null, null, null],
  ];

  const typeCount = matrixUtils.getCount(testMatrix, undefined);
  t.is(typeCount, 3);
})

test('getSubmatrixSquareByDistance() - properly returns the submatrix with distance of 1', (t) => {
  const testMatrix = [
    [0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 1, '*', 1, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0],
  ];

  const expectedMatrix = [
    [1, 1, 1],
    [1, '*', 1],
    [1, 1, 1],
  ];

  const point = new Point(2, 2);

  const submatrix = matrixUtils.getSubmatrixSquareByDistance(testMatrix, point, 1);
  t.is(Array.toString(submatrix), Array.toString(expectedMatrix));
})

test('getSubmatrixSquareByDistance() - handles submatrix when distance from given point could be negatively outside the matrix', (t) => {
  const testMatrix = [
    ['*', 1, 2, 0, 0],
    [1, 1, 2, 0, 0],
    [2, 2, 2, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ];

  const expectedMatrix = [
    ['*', 1, 2],
    [1, 1, 2],
    [2, 2, 2],
  ];

  const point = new Point(0, 0);

  const submatrix = matrixUtils.getSubmatrixSquareByDistance(testMatrix, point, 2);
  t.is(Array.toString(submatrix), Array.toString(expectedMatrix));
})

test('getSubmatrixSquareByDistance() - handles submatrix when distance from given point could be overflow outside the matrix', (t) => {
  const testMatrix = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 2, 2, 2],
    [0, 0, 2, 1, 1],
    [0, 0, 2, 1, '*'],
  ];

  const expectedMatrix = [
    [2, 2, 2],
    [2, 1, 1],
    [2, 1, '*'],
  ];

  const point = new Point(4, 4);

  const submatrix = matrixUtils.getSubmatrixSquareByDistance(testMatrix, point, 2);
  t.is(Array.toString(submatrix), Array.toString(expectedMatrix));
})

test('getSubmatrixByDistance() - gets appropriate submatrix but with null at empty spots', (t) => {
  const testMatrix = [
    [0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 1, '*', 1, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0],
  ];

  const expectedMatrix = [
    [null, null, 0, null, null],
    [null, 1, 1, 1, null],
    [0, 1, '*', 1, 0],
    [null, 1, 1, 1, null],
    [null, null, 0, null, null],
  ];

  const point = new Point(2, 2);

  const submatrix = matrixUtils.getSubmatrixByDistance(testMatrix, point, 2);
  t.is(Array.toString(submatrix), Array.toString(expectedMatrix));
})

test('getTypeCountsAdjacentTo() - gets the counts of adjacent values', (t) => {
  const testMatrix = [
    [0, 0, 0, 0, 0],
    [0, 1, 2, 1, 0],
    [0, 2, '*', 3, 0],
    [0, 1, 3, 1, 0],
    [0, 0, 0, 0, 0],
  ];

  const expectedCounts = {
    2: 2,
    3: 2,
  }

  const typeCountMap = matrixUtils.getTypeCountsAdjacentTo(testMatrix, new Point(2, 2));
  t.deepEqual(typeCountMap, expectedCounts);
})
