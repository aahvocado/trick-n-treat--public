import Point from '@studiomoniker/point';

import * as houseCollection from 'collections/houseCollection';

import {TILE_TYPES} from 'constants/tileTypes';
import {MAP_SETTINGS} from 'constants/mapSettings';

import * as mathUtils from 'utilities/mathUtils';
import * as matrixUtils from 'utilities/matrixUtils';
import randomizeArray from 'utilities/randomizeArray';

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

// -- Creators place onto Map
/**
 * determines where to place
 *
 * @param {MapModel} tileMapModel
 * @returns {Array<EncounterModel>}
 */
export function findValidHouseLocation(tileMapModel) {
  return tileMapModel.getRandomEmptyLocationNearWalkableTile(1, 1, 1);
}

