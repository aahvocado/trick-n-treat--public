import Point from '@studiomoniker/point';

/**
 * Settings for the generating a Map
 * (I'm not sure a constants file is the best place for this, maybe it should be a json)
 */

export const MAP_WIDTH = 27;
export const MAP_HEIGHT = 33;
export const MAP_START = new Point(11, 11);

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
};

export default MAP_SETTINGS;
