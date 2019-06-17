import Point from '@studiomoniker/point';

import {TILE_TYPES, TILE_TYPES_NAME, RAINBOW_DEBUG_TILES} from 'constants.shared/tileTypes';

import MapModel from 'models.shared/MapModel';
import GridModel from 'models.shared/GridModel';

// import * as lightLevelUtils from 'utilities.shared/lightLevelUtils';
import * as mathUtils from 'utilities.shared/mathUtils';
import * as matrixUtils from 'utilities.shared/matrixUtils';
import * as mazeUtils from 'utilities.shared/mazeUtils';
import * as tileTypeUtils from 'utilities.shared/tileTypeUtils';
import randomWalk from 'utilities.shared/randomWalk';

/**
 * main function
 *
 * @returns {Array}
 */
export function generateMap() {
  console.log('+ Creating Map');
  const gridModel = new GridModel({
    defaultWidth: mathUtils.getRandomOdd(9, 23),
    defaultHeight: mathUtils.getRandomOdd(9, 23),
    defaultTile: TILE_TYPES.DEBUG_WALL_BLACK,
  });
  console.log('. of size', gridModel.get('width'), 'x', gridModel.get('height'));
  gridModel.snapshot();

  generateOddMaze(gridModel);
  gridModel.snapshot();

  // console.log('gridModel', gridModel.export().grid);
  return gridModel.export().history;
  // return gridModel.get('history');
}
/**
 * odd maze
 *
 * @param {GridModel} gridModel
 */
export function generateOddMaze(gridModel) {
  console.time('MapGenTime');

  // STEP 1
  console.log('+ Generating Regions');
  const regionIterations = 12;
  for (let iteration = 0; iteration < regionIterations; iteration++) {
    const tileType = RAINBOW_DEBUG_TILES[iteration % RAINBOW_DEBUG_TILES.length];
    generateRegion(gridModel, {tileType});
  }

  // STEP 2
  console.log('+ Generating Paths');
  gridModel.nthCell(2, 0, (cell) => {
    const surroundingCells = gridModel.getSurrounding(cell.get('point'));

    // if every single cell surrounding this is a Wall, we can carve a maze through it
    const isNearExistingTile = surroundingCells.some((adjacentCell) => !tileTypeUtils.isWallTile(adjacentCell.get('tileType')));
    if (!isNearExistingTile) {
      console.log('. . .');
      mazeUtils.generateMaze(gridModel, cell.get('point'));
    }
  });

  // STEP 3
  console.log('+ Finding Connecting Regions');
  mazeUtils.connectRegions(gridModel);
}
/**
 * makes a rectangle in the given grid
 *
 * @param {GridModel} gridModel
 * @param {Object} [options]
 */
export function generateRegion(gridModel, options = {}) {
  const {
    tileType = TILE_TYPES.DEBUG_WHITE,
  } = options;

  const randomWidth = mathUtils.getRandomOdd(5, 11);
  const randomHeight = mathUtils.getRandomOdd(5, 11);
  // console.log('. . looking for a', randomWidth, 'x', randomHeight, 'area');

  // pick a coordinate to place this region
  const randomLocation = gridModel.findFitPoint(randomWidth, randomHeight, (cell) => {
    return cell !== undefined && tileTypeUtils.isWallTile(cell.get('tileType'))
  });
  if (randomLocation === undefined) {
    return;
  }

  // make sure the location has even-numbered coordinates
  if (randomLocation.x % 2 === 1) {
    randomLocation.x += 1;
  }
  if (randomLocation.y % 2 === 1) {
    randomLocation.y += 1;
  }

  // going to subract 2 from the size to treat them as a border
  const regionGridModel = new GridModel({
    defaultWidth: randomWidth - 2,
    defaultHeight: randomHeight - 2,
    defaultTile: tileType,
  });

  gridModel.get('regionList').push(regionGridModel);

  gridModel.paste(regionGridModel, randomLocation);
  gridModel.snapshot();
}
