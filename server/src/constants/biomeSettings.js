import Point from '@studiomoniker/point';

import {
  MAP_START,
  MAP_WIDTH,
  MAP_HEIGHT,
  HALF_MAP_HEIGHT,
} from 'constants/mapSettings';

import * as mathUtils from 'utilities.shared/mathUtils';
import * as pointUtils from 'utilities.shared/pointUtils';

/**
 * @typedef {Object} BiomeSettings
 * @property {Number} BiomeSettings.width
 * @property {Number} BiomeSettings.height
 * @property {Point} BiomeSettings.location - where to place
 */

/**
 * settings for Home Neighborhood Biome
 *
 * @type {BiomeSettings}
 */
const homeBiomeWidth = mathUtils.makeOdd(Math.floor(MAP_WIDTH * 0.6));
const homeBiomeHeight = mathUtils.makeOdd(Math.floor(MAP_HEIGHT * 0.4));
const homeLocation = pointUtils.makePointEven(new Point(
  mathUtils.getRandomInt(MAP_START.x - Math.floor(homeBiomeWidth / 2), MAP_START.x - Math.floor(homeBiomeWidth / 2)),
  mathUtils.getRandomInt(MAP_START.y - Math.floor(homeBiomeHeight / 2), MAP_START.y - Math.floor(homeBiomeHeight / 2)),
));
export const HOME_BIOME_SETTINGS = {
  width: homeBiomeWidth,
  height: homeBiomeHeight,
  location: homeLocation,
};
/**
 * settings for Graveyard Biome
 *
 * @type {BiomeSettings}
 */
const graveyardWidth = 11;
const graveyardHeight = 10;
const graveyardLocation = new Point(
  mathUtils.getRandomInt(0, MAP_WIDTH - graveyardWidth),
  mathUtils.getRandomInt(0, Math.floor((HALF_MAP_HEIGHT - graveyardHeight) / 2)),
);

export const GRAVEYARD_BIOME_SETTINGS = {
  width: graveyardWidth,
  height: graveyardHeight,
  location: graveyardLocation,
};
/**
 * settings for Fancy Neighborhood Biome
 *  will try to be near the bottommost
 *
 * @type {BiomeSettings}
 */
const fancyBiomeWidth = Math.floor(MAP_WIDTH * 0.85);
const fancyBiomeHeight = 4;
const fancyBiomeLocation = new Point(
  mathUtils.getRandomInt(0, MAP_WIDTH - fancyBiomeWidth),
  mathUtils.getRandomInt(MAP_HEIGHT - fancyBiomeHeight - 3, MAP_HEIGHT - fancyBiomeHeight),
);
export const FANCY_BIOME_SETTINGS = {
  width: fancyBiomeWidth,
  height: fancyBiomeHeight,
  location: fancyBiomeLocation,
};
/**
 * settings for all Biomes
 *
 * @type {Object}
 */
export const BIOME_SETTINGS = {
  HOME: HOME_BIOME_SETTINGS,
  GRAVEYARD: GRAVEYARD_BIOME_SETTINGS,
  FANCY: FANCY_BIOME_SETTINGS,
};
