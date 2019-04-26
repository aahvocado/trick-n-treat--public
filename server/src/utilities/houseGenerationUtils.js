import Point from '@studiomoniker/point';

import {TILE_TYPES} from 'constants.shared/tileTypes';
import {MAP_SETTINGS} from 'constants/mapSettings';

import HouseModel from 'models/HouseModel';

import pickRandomWeightedChoice from 'utilities.shared/pickRandomWeightedChoice';
import * as mathUtils from 'utilities.shared/mathUtils';
import * as matrixUtils from 'utilities.shared/matrixUtils';
import randomizeArray from 'utilities.shared/randomizeArray';

/**
 * chance of using generating one of these generic Houses
 */
const genericHouseDataList = [
  {
    // normal house
    weight: 70,
    returns: {
      onTrick: (houseModel, characterModel) => {
        const randomAddCandy = mathUtils.getRandomIntInclusive(3, 5);
        characterModel.modifyStat('candies', randomAddCandy);
      },
      onTreat: (houseModel, characterModel) => {
        const randomAddCandy = mathUtils.getRandomIntInclusive(1, 4);
        characterModel.modifyStat('candies', randomAddCandy);
      },
    },
  }, {
    // lame house
    weight: 33,
    returns: {
      checkCanTrick: () => true,
      onTrick: (houseModel, characterModel) => {
        characterModel.modifyStat('candies', 1);
      },
      checkCanTreat: () => true,
      onTreat: (houseModel, characterModel) => {
        characterModel.modifyStat('candies', 1);
      },
    },
  }, {
    // super sweet house
    weight: 1,
    returns: {
      onTrick: (houseModel, characterModel) => {
        const numberTrickers = houseModel.get('trickers').length;
        const randomAddCandy = mathUtils.getRandomIntInclusive(8 - numberTrickers, 12 - numberTrickers);
        characterModel.modifyStat('candies', randomAddCandy);
      },
      onTreat: (houseModel, characterModel) => {
        characterModel.modifyStat('candies', 10);
      },
    },
  },
];

// -- primary
/**
 * generates Houses onto given MapModel
 *
 * @param {MapModel} mapModel
 * @param {BiomeSettings} biomeSettings
 * @returns {Array<HouseModel>}
 */
export function generateHouses(mapModel, biomeSettings) {
  const {
    numHouses
  } = biomeSettings;

  const newHousesList = [];
  for (let i=0; i<numHouses; i++) {
    const newHouseModel = createNewGenericHouse(mapModel);
    newHousesList.push(newHouseModel);
  }

  return newHousesList;
}
// -- find
/**
 * determines where to place
 *
 * @param {MapModel} mapModel
 * @returns {Point}
 */
export function findValidHouseLocation(mapModel) {
  return mapModel.getRandomEmptyLocationNearWalkableTile(1, 1, 1);
}
// -- place
/**
 * does the entire House creating process
 * - picks a place to put it
 * - changes the tile to a house
 * - generates a House model
 *
 * returns the HouseModel that was created
 *
 * @param {MapModel} mapModel
 * @returns {HouseModel}
 */
export function createNewGenericHouse(mapModel) {
  const houseLocation = findValidHouseLocation(mapModel);
  // mapModel.setTileAt(houseLocation, TILE_TYPES.HOUSE);

  const houseData = pickRandomWeightedChoice(genericHouseDataList);
  const newHouseModel = new HouseModel({
    ...houseData,
    position: houseLocation,
  });

  return newHouseModel;
}
