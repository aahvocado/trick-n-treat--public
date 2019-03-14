import Point from '@studiomoniker/point';

import * as mathUtils from 'utilities/mathUtils';

/**
 * counting the number of tiles per row and column in a matrix
 */
export const MAP_WIDTH = 27;
export const MAP_HEIGHT = 33;

/**
 * randomly pick a starting Point
 */
const startX = mathUtils.getRandomIntInclusive(1, MAP_WIDTH - 1);
const startY = mathUtils.getRandomIntInclusive(1, MAP_HEIGHT - 1);
export const MAP_START = new Point(startX, startY);

/**
 * Base settings for the generating a Map
 */
export const MAP_SETTINGS = {
  width: MAP_WIDTH,
  height: MAP_HEIGHT,
  startPoint: MAP_START,

  numSteps: 200,
  stepSize: 3,

  numSpecialTiles: 6,
  specialMinDistance: 9,

  numSectors: 10,
  sectorSize: 10,
  numHousePerSector: 10,
  houseMinDistance: 1,

  encounterMinDistance: 1,
  encounterRangeDistance: [1, 2],
};

export default MAP_SETTINGS;
