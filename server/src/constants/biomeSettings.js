import Point from '@studiomoniker/point';

import {
  MAP_START,
  MAP_WIDTH,
  MAP_HEIGHT,
  HALF_MAP_HEIGHT,
} from 'constants/mapSettings';

import * as mathUtils from 'utilities/mathUtils';

/**
 * @typedef {Object} BiomeSettings
 * @property {Number} BiomeSettings.width
 * @property {Number} BiomeSettings.height
 * @property {Point} BiomeSettings.spawnPoint - where to place
 * @property {Array<Point>} BiomeSettings.connectingPoints - where other paths can connect to
 */

/**
 * settings for Home Neighborhood Biome
 *
 * @type {BiomeSettings}
 */
const homeBiomeWidth = Math.floor(MAP_WIDTH * 0.4);
const homeBiomeHeight = Math.floor(MAP_HEIGHT * 0.4);
const homeSpawnPoint = new Point(
  mathUtils.getRandomIntInclusive(MAP_START.x - Math.floor(homeBiomeWidth / 2), MAP_START.x - Math.floor(homeBiomeWidth / 2)),
  mathUtils.getRandomIntInclusive(MAP_START.y - Math.floor(homeBiomeHeight / 2), MAP_START.y - Math.floor(homeBiomeHeight / 2)),
);
export const HOME_BIOME_SETTINGS = {
  width: homeBiomeWidth,
  height: homeBiomeHeight,
  spawnPoint: homeSpawnPoint,
  connectingPoints: [homeSpawnPoint],

  numHouses: 25,
};
/**
 * settings for Graveyard Biome
 *
 * @type {BiomeSettings}
 */
const graveyardWidth = 11;
const graveyardHeight = 10;
const graveyardSpawnPoint = new Point(
  mathUtils.getRandomIntInclusive(0, MAP_WIDTH - graveyardWidth),
  mathUtils.getRandomIntInclusive(0, Math.floor((HALF_MAP_HEIGHT - graveyardHeight) / 2)),
);
export const GRAVEYARD_BIOME_SETTINGS = {
  width: graveyardHeight,
  height: graveyardWidth,
  spawnPoint: graveyardSpawnPoint,
  connectingPoints: [
    new Point((graveyardSpawnPoint.x + Math.floor(graveyardWidth / 2)), (graveyardSpawnPoint.y + graveyardHeight - 1)),
  ],
};
/**
 * settings for all Biomes
 *
 * @type {Object}
 */
export const BIOME_SETTINGS = {
  HOME: HOME_BIOME_SETTINGS,
  GRAVEYARD: GRAVEYARD_BIOME_SETTINGS,
};
