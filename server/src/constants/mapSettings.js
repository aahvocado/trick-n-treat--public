/**
 * Settings for the generating a Map
 * (I'm not sure a constants file is the best place for this, maybe it should be a json)
 */

export const MAP_SETTINGS = {
  width: 21,
  height: 31,
  startCoordinates: [10, 15],

  numSteps: 200,
  stepSize: 3,

  numSpecialTiles: 4,
  specialMinDistance: 9,

  numHouseTiles: 20,
  houseBlockSize: 5,
  houseMinDistance: 2,
};

export default MAP_SETTINGS;
