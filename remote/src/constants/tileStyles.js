import {TILE_SIZE} from 'constants/mapConstants';
import {TILE_TYPES} from 'constants.shared/tileTypes';

export const TILE_STYLES = {
  [TILE_TYPES.EMPTY]: { backgroundColor: '#313131' },

  [TILE_TYPES.DEBUG]: { backgroundColor: '#e5fdf4' },
  [TILE_TYPES.LIT_DEBUG]: { backgroundColor: '#e5fdf4' },
  [TILE_TYPES.CONNECTOR]: { backgroundColor: '#edf7c4' },
  [TILE_TYPES.LIT_CONNECTOR]: { backgroundColor: '#edf7c4' },

  [TILE_TYPES.PATH]: { backgroundColor: '#8e3e3e' },
  [TILE_TYPES.LIT_PATH]: { backgroundColor: '#8e3e3e' },

  [TILE_TYPES.GRASS]: { backgroundColor: 'lightgreen' },
  [TILE_TYPES.LIT_GRASS]: { backgroundColor: 'lightgreen' },

  [TILE_TYPES.SIDEWALK]: { backgroundColor: '#99caff' },
  [TILE_TYPES.LIT_SIDEWALK]: { backgroundColor: '#99caff' },

  [TILE_TYPES.ROAD]: { backgroundColor: '#c792c7' },
  [TILE_TYPES.LIT_ROAD]: { backgroundColor: '#c792c7' },

  [TILE_TYPES.SWAMP]: { backgroundColor: '#31ab8a' },
  [TILE_TYPES.LIT_SWAMP]: { backgroundColor: '#31ab8a' },

  [TILE_TYPES.PLANKS]: { backgroundColor: '#99caff' },
  [TILE_TYPES.PLANKS_TWO]: { backgroundColor: '#99caff' },

  [TILE_TYPES.WOODS]: { backgroundColor: '#8cb9a5' },
  [TILE_TYPES.LIT_WOODS]: { backgroundColor: '#8cb9a5' },
  [TILE_TYPES.WOODS_TWO]: { backgroundColor: '#8cb9a5' },
  [TILE_TYPES.LIT_WOODS_TWO]: { backgroundColor: '#8cb9a5' },

  [TILE_TYPES.HOUSE]: {
    backgroundColor: '#33c3ff',
    border: '1px solid #299fd0',
  },
  [TILE_TYPES.ENCOUNTER]: { backgroundColor: '#d0ffd0' },
  [TILE_TYPES.SPECIAL]: { backgroundColor: '#da5cff' },

  [TILE_TYPES.TREE_ONE]: { backgroundImage: 'repeating-linear-gradient(45deg, #556f64, #556f64 5px, #8cb9a5 5px, #8cb9a5 12px)' },
  [TILE_TYPES.TREE_TWO]: { backgroundImage: 'repeating-linear-gradient(45deg, #556f64, #556f64 5px, #8cb9a5 5px, #8cb9a5 12px)' },
  [TILE_TYPES.TREE_THREE]: { backgroundImage: 'repeating-linear-gradient(45deg, #556f64, #556f64 5px, #8cb9a5 5px, #8cb9a5 12px)' },
  [TILE_TYPES.SPOOKY_TREE_ONE]: { backgroundImage: 'repeating-linear-gradient(45deg, #8c56a7, #8c56a7 5px, #66a756 5px, #66a756 12px)' },
  [TILE_TYPES.BUSH]: { backgroundImage: 'repeating-linear-gradient(45deg, #69af4f, #69af4f 5px, #8cb9a5 5px, #8cb9a5 12px)' },
};

/**
 * @param {Number} lightLevel
 */
export function createLightingStyles(lightLevel) {
  if (lightLevel === 0 || lightLevel === 10) {
    return {};
  }

  const lightDecimal = 1 - (lightLevel / 10);
  const opacity = Math.min(Math.max(lightDecimal, 0), 10);
  return {
    backgroundColor: `rgb(49, 49, 49, ${opacity})`,
    position: 'absolute',
    width: '100%',
    height: '100%',
  }
}
/**
 *
 * @param {Number} entityIdx
 * @returns {Object} style
 */
export function createEntityIconStyles(entityIdx) {
  const padding = 5;
  const oddOrEven = entityIdx % 2;
  const iconOffsetX = padding + (TILE_SIZE / 2.2) * oddOrEven;
  const iconOffsetY = padding + (TILE_SIZE / 2.2) * Math.floor(entityIdx / 2);

  return {
    position: 'absolute',
    left: `${iconOffsetX}px`,
    top: `${iconOffsetY}px`,
  }
}
