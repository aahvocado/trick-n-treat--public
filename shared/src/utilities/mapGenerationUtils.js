import Point from '@studiomoniker/point';

import {TILE_ID} from 'constants.shared/tileIds';

import CellModel from 'models.shared/CellModel';
import GridModel from 'models.shared/GridModel';

// import * as lightLevelUtils from 'utilities.shared/lightLevelUtils';
import * as mathUtils from 'utilities.shared/mathUtils';
import * as mazeUtils from 'utilities.shared/mazeUtils';
import * as pointUtils from 'utilities.shared/pointUtils';
import * as tileUtils from 'utilities.shared/tileUtils';
import randomWalk from 'utilities.shared/randomWalk';

const DEBUG_TILE_IDS = [
  TILE_ID.DEBUG.PINK,
  TILE_ID.DEBUG.PEACH,
  TILE_ID.DEBUG.LIME,
  TILE_ID.DEBUG.MOSS,
  TILE_ID.DEBUG.SKY,
  TILE_ID.DEBUG.DENIM,
  TILE_ID.DEBUG.SAND,
  TILE_ID.DEBUG.COFFEE,
  TILE_ID.DEBUG.CHOCOLATE,
];

/**
 * map gen that does most of everything
 *
 * @returns {Array}
 */
export function generateTestMap() {
  console.log('+ Generating Test Map');
  const gridModel = new GridModel({
    defaultWidth: mathUtils.getRandomOdd(11, 23),
    defaultHeight: mathUtils.getRandomOdd(11, 23),
    defaultTile: TILE_ID.EMPTY_WALL,
  });
  console.log('. of size', gridModel.get('width'), 'x', gridModel.get('height'));
  gridModel.snapshot();

  // generate a base region
  const baseWidth = mathUtils.getRandomOdd(5, 9);
  const baseHeight = mathUtils.getRandomOdd(5, 9);
  const randomWalkGrid = generateRandomWalkGrid({
    width: baseWidth - 2,
    height: baseHeight - 2,
    defaultTile: TILE_ID.DEBUG.PEACH,
    steps: 10,
  });
  randomWalkGrid.padding(1, new CellModel({tile: TILE_ID.DEBUG.SAND}));
  gridModel.paste(randomWalkGrid, new Point(2, 2));
  gridModel.snapshot();

  //
  console.log('+ Generating Regions');
  const regionIterations = 12;
  for (let iteration = 0; iteration < regionIterations; iteration++) {
    const tileToUse = DEBUG_TILE_IDS[iteration % DEBUG_TILE_IDS.length];
    const randomWidth = mathUtils.getRandomOdd(5, 11);
    const randomHeight = mathUtils.getRandomOdd(5, 11);

    generateRegion(gridModel, randomWidth, randomHeight, {
      tileToUse: tileToUse,
    });
  }
  gridModel.snapshot();

  //
  console.log('+ Generating Paths');
  mazeUtils.generateMazeEverywhere(gridModel);
  gridModel.snapshot();

  //
  console.log('+ Connecting Regions');
  connectRegions(gridModel);

  //
  console.log('+ Removing Dead Ends');
  mazeUtils.removeDeadEnds(gridModel);

  // console.log('gridModel', gridModel.export().grid);
  return gridModel.export().history;
}
/**
 * makes a rectangle in the given grid
 *
 * @param {GridModel} gridModel
 * @param {Number} width
 * @param {Number} height
 * @param {Object} [options]
 */
export function generateRegion(gridModel, width, height, options = {}) {
  const {
    tileToUse = TILE_ID.DEBUG.WHITE,
  } = options;

  // pick a coordinate to place this region
  const randomLocation = gridModel.findFitPoint(width + 2, height + 2, (cell) => {
    return cell !== undefined && tileUtils.isWallTile(cell.get('tile'));
  });
  if (randomLocation === undefined) {
    return;
  }

  // going to subract 2 from the size to treat them as a border
  const regionGridModel = new GridModel({
    defaultWidth: width,
    defaultHeight: height,
    defaultTile: tileToUse,
  });

  gridModel.get('regionList').push(regionGridModel);

  gridModel.paste(regionGridModel, pointUtils.makePointEven(randomLocation));
  gridModel.snapshot();
}
/**
 * finds connectors
 *
 * @param {GridModel} gridModel
 * @param {Object} [options]
 * @property {Number} [options.numToOpen]
 * @returns {Array<CellModel>}
 */
export function findConnectors(gridModel) {
  // go through each cell and see if one their adjacent walls
  //  is next to a cell of a different region,
  //  if so, then it can be opened up
  const connectorsRegionsList = gridModel.contiguous((cell) => {
    const point = cell.get('point');
    const tile = cell.get('tile');

    // only walls can become connectors
    // if (!tileUtils.isWallTile(tile)) {
    if (tile !== TILE_ID.EMPTY_WALL) {
      return false;
    }

    // find the tiles adjacent to this that are not walls
    const adjacentTiles = gridModel.orthogonals(point)
      .filter((adjacentCell) => adjacentCell !== undefined)
      .map((adjacentCell) => adjacentCell.get('tile'))
      .filter((adjacentTile) => !tileUtils.isWallTile(adjacentTile));

    // find unique tiles (which represent unique regions),
    //  and it can be a connector if there are at least two unique regions
    const distinctTiles = new Set(adjacentTiles);
    if (distinctTiles.size >= 2) {
      return true;
    };
  });

  // make note of it
  connectorsRegionsList.forEach((pointList) => {
    pointList.forEach((point) => {
      const cell = gridModel.getAt(point);
      cell.set({
        tile: TILE_ID.DEBUG.BLACK_WALL,
        region: 'connector',
      });
    });
  });
  gridModel.snapshot();

  return connectorsRegionsList;
}
/**
 * opens the different regions to the maze
 * @link https://github.com/dstromberg2/maze-generator
 *
 * @param {GridModel} gridModel
 * @param {Object} options
 */
export function connectRegions(gridModel, options = {}) {
  const {
    tileToUse = TILE_ID.DEBUG.GREEN,
  } = options;

  const connectorsRegionsList = findConnectors(gridModel);
  connectorsRegionsList.forEach((pointList) => {
    // pick one of the connectors that connect regions
    const randomStartingPoint = pointList[mathUtils.getRandomInt(0, pointList.length - 1)];

    // set it to a valid tile and define its region
    const connectorCell = gridModel.getAt(randomStartingPoint);
    connectorCell.set({
      tile: tileToUse,
      region: 'primary',
      filled: true,
    });

    // make every other cell a part of this region
    mazeUtils.floodfill(gridModel, randomStartingPoint, (checkCell) => {
      const checkRegion = checkCell.get('region');
      if (checkRegion !== 'connector' && checkRegion !== 'primary') {
        checkCell.set({
          region: 'primary',
        });
        return;
      }
    });

    gridModel.snapshot();
  });
}
/**
 * goes through the edges of a grid to turn them into a EMPTY_WALL
 *
 *
 * @param {GridModel} gridModel
 * @param {Number} width
 * @param {Number} height
 */
export function shaveEdges(gridModel) {
  // find all contigiuous wall tiles
  const contiguousList = gridModel.contiguous((cell) => {
    return tileUtils.isWallTile(cell.get('tile'));
  });

  // then look through each of contiguous points,
  //  and find if any of the points are connected to an edge
  contiguousList.forEach((pointList) => {
    const isContiguousEdge = pointList.some((point) => gridModel.edge(point));
    if (!isContiguousEdge) {
      return;
    }

    // this means we found a contiguous edge wall, so turn them to EMPTY_WALL
    pointList.forEach((point) => {
      const cell = gridModel.getAt(point);
      if (cell === undefined) {
        return;
      }
      cell.set({tile: TILE_ID.EMPTY_WALL});
    });
  });
}
/**
 * generates a grid that has been random walk'd
 *
 * @param {Object} options
 * @returns {GridModel}
 */
export function generateRandomWalkGrid(options = {}) {
  const {
    width,
    height,
    defaultTile,

    steps = 200,
    minStepLength = 3,
    maxStepLength = 3,
  } = options;

  // start with a grid filled with walls
  const gridModel = new GridModel({
    defaultWidth: width,
    defaultHeight: height,
    defaultTile: tileUtils.convertToWallTile(defaultTile),
  });

  const biomeCenter = new Point(
    Math.floor(width / 2),
    Math.floor(height / 2),
  );

  // walk through it the grid
  randomWalk(gridModel, biomeCenter, steps, {
    minStepLength: minStepLength,
    maxStepLength: maxStepLength,
    stepType: defaultTile,
  });

  // done
  gridModel.snapshot();
  return gridModel;
}
