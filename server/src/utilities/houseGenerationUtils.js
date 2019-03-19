import Point from '@studiomoniker/point';

import * as houseCollection from 'collections/houseCollection';

import {TILE_TYPES} from 'constants/tileTypes';
import {MAP_SETTINGS} from 'constants/mapSettings';

import * as mathUtils from 'utilities/mathUtils';
import * as matrixUtils from 'utilities/matrixUtils';

/**
 * chance of using generating one of these generic Houses
 */
const genericHouseOddsList = [
  {
    choice: houseCollection.basicCandyHouse,
    weight: 70,
  },
  {
    choice: houseCollection.lameCandyHouse,
    weight: 33,
  },
  {
    choice: houseCollection.bestCandyHouse,
    weight: 1,
  },
];

/**
 * picks a House to generate
 *
 * @param {Object} additionalAttributes
 * @returns {HouseModel}
 */
export function generateGenericHouseModel(additionalAttributes) {
  const {choice} = mathUtils.getRandomWeightedChoice(genericHouseOddsList);
  const chosenHouseModel = choice();
  chosenHouseModel.set(additionalAttributes);
  return chosenHouseModel;
}
/**
 * creates a bunch of houses in different sectors
 *
 * @param {MapModel} mapModel
 * @returns {Array<HouseModel>}
 */
export function generateHouseList(mapModel) {
  return generateHousesUsingSectors(mapModel, MAP_SETTINGS);
}
/**
 * creates a bunch of houses in a bunch of different sectors
 *
 * @param {MapModel} mapModel
 * @param {Object} options
 * @property {Number} options.numSectors - number of House Tiles to generate
 * @returns {Array<HouseModel>}
 */
function generateHousesUsingSectors(mapModel, options) {
  const {numSectors} = options;

  const houseList = [];
  for (let i = 0; i < numSectors; i++) {
    const sectorStart = getRandomSectorLocation(mapModel, options);

    const sectorHouseList = generateHousesInSector(mapModel, Object.assign({}, options, {
      sectorStart: sectorStart,
    }));

    houseList.push(...sectorHouseList);
  };

  return houseList;
}
/**
 * gives a House Model at given position
 *
 * @param {MapModel} mapModel
 * @param {Object} options
 * @property {Number} options.numHousePerSector - number of House Tiles to generate
 * @returns {Array<HouseModel>}
 */
function generateHousesInSector(mapModel, options) {
  const {numHousePerSector} = options;

  const houseList = [];

  for (let i = 0; i < numHousePerSector; i++) {
    // if we didn't get a valid point to generate this house, move on
    const placementPoint = getRandomHouseTileLocation(mapModel, options);
    if (placementPoint === null) {
      continue;
    };

    // check for duplicate placementPoint
    const isHouseAlreadyAtPoint = mapModel.isTileEqualTo(placementPoint, TILE_TYPES.HOUSE);
    if (isHouseAlreadyAtPoint) {
      continue;
    }

    // otherwise we can place a house and generate a model
    mapModel.setTileAt(placementPoint, TILE_TYPES.HOUSE);

    const houseModel = generateGenericHouseModel({
      position: placementPoint,
    });

    houseList.push(houseModel);
  };

  return houseList;
}
/**
 * generates a Sector starting point where a bunch of houses are placed in
 *
 * @param {MapModel} mapModel
 * @param {Object} options
 * @returns {Point}
 */
export function getRandomSectorLocation(mapModel, options) {
  const {sectorSize} = options;

  // we want to pick a location that's not at the extremes
  const placementPoint = new Point(
    mathUtils.getRandomIntInclusive(1, mapModel.getWidth() - sectorSize - 2),
    mathUtils.getRandomIntInclusive(1, mapModel.getHeight() - sectorSize - 2)
  );

  return placementPoint;
}
/**
 * look for a place to place a house with given rules
 * - adjacent to a path
 * - far enough away from another house
 *
 * @param {MapModel} mapModel
 * @param {Object} options
 * @property {Number} options.houseMinDistance - number of House Tiles to generate
 * @property {Number} options.sectorSize - number of House Tiles to generate
 * @property {Point} options.sectorStart - where the sector starts
 * @returns {Point}
 */
export function getRandomHouseTileLocation(mapModel, options) {
  const {
    houseMinDistance,
    sectorSize,
    sectorStart,
  } = options;

  // create a Matrix of the sector so we can look for empty tiles in there
  const emptyTilePoints = [];
  const sectorMatrix = mapModel.getSubmatrixSquare(sectorStart.x, sectorStart.y, sectorStart.x + sectorSize, sectorStart.y + sectorSize);
  for (let y = 0; y < sectorMatrix.length; y++) {
    const searchRow = sectorMatrix[y];
    for (let x = 0; x < searchRow.length; x++) {
      // adjust the point relative to the Map
      const pointToCheck = new Point(sectorStart.x + x, sectorStart.y + y);

      // check if it is empty we can add it to the list
      if (mapModel.getTileAt(pointToCheck) === 0) {
        emptyTilePoints.push(pointToCheck);
      }
    }
  }

  // randomize order
  matrixUtils.shuffleArray(emptyTilePoints);

  // try and see if any of the found empty tiles follow our rules
  const mapMatrix = mapModel.getMatrix();
  const appropriatePoint = emptyTilePoints.find((emptyPoint) => {
    const isAdjacentToPath = matrixUtils.hasAdjacentTileType(mapMatrix, emptyPoint, TILE_TYPES.PATH);
    const isNearbyToHouse = matrixUtils.hasNearbyTileType(mapMatrix, emptyPoint, TILE_TYPES.HOUSE, houseMinDistance);
    return isAdjacentToPath && !isNearbyToHouse;
  });

  // if none of them were good, try again
  if (!appropriatePoint) {
    // todo - potentially causes infinite looop
    // return getRandomHouseTileLocation(mapModel, houseOptions);
    return null;
  }

  // we found a good point!
  return appropriatePoint;
}
