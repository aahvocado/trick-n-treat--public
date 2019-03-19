import HouseModel from 'models/HouseModel';

import * as mathUtils from 'utilities/mathUtils';

// -- just some houses
/**
 * the most generic implementation
 * @returns {HouseModel}
 */
export const basicCandyHouse = () => {
  return new HouseModel({
    onTrick: (houseModel, characterModel) => {
      const randomAddCandy = mathUtils.getRandomIntInclusive(3, 5);
      characterModel.modifyStat('candies', randomAddCandy);
    },
    onTreat: (houseModel, characterModel) => {
      const randomAddCandy = mathUtils.getRandomIntInclusive(1, 4);
      characterModel.modifyStat('candies', randomAddCandy);
    },
  });
};
/**
 * you always get one
 * @returns {HouseModel}
 */
export const lameCandyHouse = () => {
  return new HouseModel({
    checkCanTrick: () => true,
    onTrick: (houseModel, characterModel) => {
      characterModel.modifyStat('candies', 1);
    },
    checkCanTreat: () => true,
    onTreat: (houseModel, characterModel) => {
      characterModel.modifyStat('candies', 1);
    },
  });
};
/**
 * aw yes
 * @returns {HouseModel}
 */
export const bestCandyHouse = () => {
  return new HouseModel({
    onTrick: (houseModel, characterModel) => {
      const numberTrickers = houseModel.get('trickers').length;
      const randomAddCandy = mathUtils.getRandomIntInclusive(8 - numberTrickers, 12 - numberTrickers);
      characterModel.modifyStat('candies', randomAddCandy);
    },
    onTreat: (houseModel, characterModel) => {
      characterModel.modifyStat('candies', 10);
    },
  });
};

/**
 * this should be a list of every possible House
 *
 * @type {Array<EventModel>}
 */
const allHouseCollection = [
  basicCandyHouse,
  lameCandyHouse,
  bestCandyHouse,
];
/**
 * @returns {Array<EventModel>}
 */
export function getAllHouseModels() {
  return allHouseCollection.slice();
};
