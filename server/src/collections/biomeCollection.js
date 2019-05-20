import {TILE_TYPES} from 'constants.shared/tileTypes';
const {
  EMPTY,
  PATH,
  LIT_PATH,
} = TILE_TYPES;

/**
 * Biomes are unique map areas
 *
 * idea list?
    swamp
    subway
    train station
    bus stop
    graveyard
    rich neighborhood
    gentrified area
    abandoned area
    convenience store
 */

/**
 * Graveyard Biome
 */
export const graveyardBiomeBaseMatrix = [
  [null, PATH, PATH, PATH, PATH, LIT_PATH, PATH, PATH, PATH, PATH, null],
  [PATH, PATH, PATH, EMPTY, PATH, PATH, PATH, EMPTY, PATH, PATH, PATH],
  [PATH, EMPTY, PATH, PATH, PATH, EMPTY, PATH, EMPTY, PATH, EMPTY, PATH],
  [PATH, EMPTY, PATH, EMPTY, PATH, EMPTY, PATH, PATH, PATH, PATH, PATH],
  [PATH, PATH, PATH, EMPTY, PATH, PATH, PATH, EMPTY, PATH, EMPTY, PATH],
  [PATH, EMPTY, PATH, PATH, PATH, PATH, PATH, PATH, PATH, EMPTY, PATH],
  [PATH, PATH, PATH, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, PATH, PATH, PATH],
  [null, PATH, PATH, PATH, PATH, EMPTY, PATH, PATH, PATH, PATH, null],
  [null, null, null, PATH, LIT_PATH, EMPTY, LIT_PATH, PATH, null, null, null],
  [null, null, null, null, PATH, PATH, PATH, null, null, null, null],
];
