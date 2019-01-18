import test from 'ava';
import * as matrixUtils from 'utilities/matrixUtils';

test('getSubmatrix() - returns the submatrix with the data', (t) => {
  const testMatrix = [
    [0, 0, 0, 0, 0],
    [0, 1, 1, 0, 0],
    [0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ];

  const expectedMatrix = [
    [1, 1],
    [1, 1],
  ];

  const submatrix = matrixUtils.getSubmatrix(testMatrix, 1, 1, 2, 2);
  t.is(Array.toString(submatrix), Array.toString(expectedMatrix));
})

test('hasNearbyTileType() - returns false if tile is not nearby, using a distance of 1', (t) => {
  const testMatrix = [
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ];
  const point = {x: 2, y: 2};

  const isNearby = matrixUtils.hasNearbyTileType(testMatrix, point, 1, 1);
  t.false(isNearby);
})

test('hasNearbyTileType() - returns true if tile is nearby, using a distance of 2', (t) => {
  const testMatrix = [
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ];
  const point = {x: 2, y: 2};

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
    [0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ];
  const point = {x: 2, y: 2};

  const hasTile = matrixUtils.hasAdjacentTileType(testMatrix, point, 2);
  t.true(hasTile);
})
test('hasAdjacentTileType() - returns false if no tiles directly adjacent match given type', (t) => {
  const testMatrix = [
    [0, 0, 0, 0, 0],
    [0, 2, 0, 2, 0],
    [0, 0, 1, 0, 0],
    [0, 2, 0, 2, 0],
    [0, 0, 0, 0, 0],
  ];
  const point = {x: 2, y: 2};

  const hasTile = matrixUtils.hasAdjacentTileType(testMatrix, point, 2);
  t.false(hasTile);
})
