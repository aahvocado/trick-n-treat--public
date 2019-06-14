import Point from '@studiomoniker/point';

import {TILE_TYPES, TILE_TYPES_NAME, RAINBOW_DEBUG_TILES} from 'constants.shared/tileTypes';

import MapModel from 'models.shared/MapModel';

// import * as lightLevelUtils from 'utilities.shared/lightLevelUtils';
import * as mathUtils from 'utilities.shared/mathUtils';
import * as matrixUtils from 'utilities.shared/matrixUtils';
import * as mazeUtils from 'utilities.shared/mazeUtils';
import randomWalk from 'utilities.shared/randomWalk';

/**
 * main function
 *
 * @returns {Array}
 */
export function generateMap() {
  const testHistory = [];
  console.time('MapGenTime');

  const mainWidth = 21;
  const mainHeight = 21;
  if (mainWidth * mainHeight > 1000) {
    console.error('Don\t do it bro!');
    return;
  }

  const mainMap = new MapModel({
    defaultWidth: mainWidth,
    defaultHeight: mainHeight,
    defaultTileType: TILE_TYPES.DEBUG_BLACK,
  });

  // STEP 1
  console.log('+ Generating Regions');
  const regionIterations = 4;
  for (let iteration=0; iteration<regionIterations; iteration++) {
    const tileType = RAINBOW_DEBUG_TILES[iteration % RAINBOW_DEBUG_TILES.length];
    const randomWidth = mathUtils.getRandomOdd(5, 9);
    const randomHeight = mathUtils.getRandomOdd(5, 9);

    // pick an empty coordinate to place this region
    const randomLocation = mainMap.getRandomEmptyLocation(randomWidth, randomHeight);
    if (randomLocation !== undefined) {
      // maintain an even location
      if (randomLocation.x % 2 === 1) {
        randomLocation.x += 1;
      }
      if (randomLocation.y % 2 === 1) {
        randomLocation.y += 1;
      }

      // going to subract 2 from the size to treat them as a border
      const regionModel = new MapModel({
        defaultWidth: randomWidth - 2,
        defaultHeight: randomHeight - 2,
        defaultTileType: tileType,
      });
      mainMap.mergeMatrixModel(regionModel, randomLocation);

      // add to history
      const mazematrix = mazeUtils.convertMatrixToMaze(mainMap.getMatrix());
      testHistory.push(mazematrix.export());
    }
  }

  // STEP 2
  console.log('+ Generating Paths');
  const mazeModel = mazeUtils.convertMatrixToMaze(mainMap.get('matrix'));
  mazeModel.get('mapHistory').replace([]);
  mazeUtils.oddMaze(mazeModel, new Point(0, 0));
  mazeModel.get('mapHistory').forEach((matrix, idx) => {
    testHistory.push(matrix);
  });

  // finished
  console.timeEnd('MapGenTime');
  testHistory.push(mazeModel.export());
  return testHistory;
}
/**
 * maze lol
 *
 * @returns {Array}
 */
export function generateMaze() {
  let testHistory = [];
  console.time('MapGenTime');

  const regionList = [];
  const roomIterations = 10;

  const mainWidth = 21;
  const mainHeight = 21;
  const mainCenter = new Point(
    Math.floor(mainWidth / 2),
    Math.floor(mainHeight / 2)
  );
  const mainMap = new MapModel({
    defaultWidth: mainWidth,
    defaultHeight: mainHeight,
    defaultTileType: TILE_TYPES.DEBUG_BLACK,
  });

  // STEP 1
  console.log('+ Generating Regions');
  for (let iteration=0; iteration<roomIterations; iteration++) {
    const tileType = RAINBOW_DEBUG_TILES[iteration % RAINBOW_DEBUG_TILES.length];
    const randomWidth = mathUtils.getRandomIntInclusive(3, 6);
    const randomHeight = mathUtils.getRandomIntInclusive(3, 6);

    // pick an empty coordinate to place this region
    const randomLocation = mainMap.getRandomEmptyLocation(randomWidth, randomHeight);
    if (randomLocation !== undefined) {
      // going to subract 2 from the size to treat them as a border
      const regionModel = new MapModel({
        defaultWidth: randomWidth - 1,
        defaultHeight: randomHeight - 1,
        defaultTileType: tileType,
      });
      regionList.push(regionModel);

      // offset the border with `addNum(1)`
      mainMap.mergeMatrixModel(regionModel, randomLocation.addNum(1));

      // add to history
      const mazematrix = mazeUtils.convertMatrixToMaze(mainMap.getMatrix());
      testHistory.push(mazematrix.export());
    }
  }

  // STEP 2
  console.log('+ Generating Maze');
  const mazeModel = mazeUtils.convertMatrixToMaze(mainMap.get('matrix'));
  const firstUnvisitedCell = mazeModel.getUnvisitedCells()[0];
  const startPoint = firstUnvisitedCell.get('point');
  mazeUtils.depthFirstMaze(mazeModel, startPoint);
  mazeModel.get('mapHistory').forEach((matrix, idx) => {
    if (idx % 3 === 1) {
      testHistory.push(matrix);
    }
  });

  // STEP 3
  console.log('+ Opening Regions');
  mazeModel.get('mapHistory').replace([]);
  mazeUtils.openRegions(mazeModel);
  mazeModel.get('mapHistory').forEach((matrix, idx) => {
    testHistory.push(matrix);
  });

  // STEP 4
  console.log('+ Floodfill');
  mazeModel.get('mapHistory').replace([]);
  mazeUtils.floodfill(mazeModel, new Point(0, 0), TILE_TYPES.DEBUG_YELLOW);
  mazeModel.get('mapHistory').forEach((matrix, idx) => {
    if (idx % 3 === 1) {
      testHistory.push(matrix);
    }
  });

  console.timeEnd('MapGenTime');
  // final result
  testHistory.push(mazeModel.export());
  return testHistory;
}
