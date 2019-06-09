import {TILE_SIZE} from 'constants/mapConstants';

import {TILE_TYPES} from 'constants.shared/tileTypes';

import hexToRgba from 'utilities/hexToRgba';

import * as lightLevelUtils from 'utilities.shared/lightLevelUtils';
import * as tileTypeUtils from 'utilities.shared/tileTypeUtils';

export const TILE_COLOR_MAP = {
  [TILE_TYPES.EMPTY]: '#313131',

  [TILE_TYPES.DEBUG]: '#e5fdf4',
  [TILE_TYPES.LIT_DEBUG]: '#e5fdf4',
  [TILE_TYPES.CONNECTOR]: '#edf7c4',
  [TILE_TYPES.LIT_CONNECTOR]: '#edf7c4',

  [TILE_TYPES.PATH]: '#8e3e3e',
  [TILE_TYPES.LIT_PATH]: '#8e3e3e',

  [TILE_TYPES.GRASS]: 'lightgreen',
  [TILE_TYPES.LIT_GRASS]: 'lightgreen',

  [TILE_TYPES.SIDEWALK]: '#99caff',
  [TILE_TYPES.LIT_SIDEWALK]: '#99caff',

  [TILE_TYPES.ROAD]: '#c792c7',
  [TILE_TYPES.LIT_ROAD]: '#c792c7',

  [TILE_TYPES.SWAMP]: '#31ab8a',
  [TILE_TYPES.LIT_SWAMP]: '#31ab8a',

  [TILE_TYPES.PLANKS]: '#99caff',
  [TILE_TYPES.PLANKS_TWO]: '#99caff',

  [TILE_TYPES.WOODS]: '#8cb9a5',
  [TILE_TYPES.LIT_WOODS]: '#8cb9a5',
  [TILE_TYPES.WOODS_TWO]: '#8cb9a5',
  [TILE_TYPES.LIT_WOODS_TWO]: '#8cb9a5',

  [TILE_TYPES.HOUSE]: '#33c3ff',
  [TILE_TYPES.ENCOUNTER]: '#d0ffd0',
  [TILE_TYPES.SPECIAL]: '#da5cff',

  [TILE_TYPES.TREE_ONE]: '#3a7d3a',
  [TILE_TYPES.TREE_TWO]: '#3a7d3a',
  [TILE_TYPES.TREE_THREE]: '#3a7d3a',
  [TILE_TYPES.SPOOKY_TREE_ONE]: '#5a2e2e',
  [TILE_TYPES.BUSH]: '#3a7d3a',
};

/**
 * @param {Color} color
 * @returns {String}
 */
function createGradient(color) {
  return `repeating-linear-gradient(-45deg, transparent 0 3px, ${color} 3px 6px)`;
}
/**
 * @link https://gist.github.com/gre/1650294
 * @param {Number} percent - between 0 and 1
 * @return {Number}
 */
function calculateOpacity(percent) {
  let t = percent;
  return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t;
}
/**
 * @param {Object} options
 * @returns {Object}
 */
export function createTileStyles(options = {}) {
  const {
    lightLevel,
    isTooFar,
    isSelected,
    isUserHere,
    tileSize,
    tileType,
  } = options;

  // calculate some values
  const isWalkable = tileTypeUtils.isWalkableTile(tileType);
  const isHidden = lightLevelUtils.isHidden(lightLevel);
  const isMostlyHidden = lightLevelUtils.isMostlyHidden(lightLevel);

  // calculate opacity
  const opacity = calculateOpacity(lightLevel / 10);

  // border color depends on visibility and distance
  const borderColor = (() => {
    if (isUserHere) {
      return '#f9e358';
    }

    if (isSelected && isTooFar) {
      return '#b7246f';
    }

    if (isSelected && isWalkable) {
      return 'white';
    }

    if (!isWalkable && isHidden) {
      return 'black';
    }

    return 'black';
  })();

  // bg
  const tileColor = TILE_COLOR_MAP[tileType];
  const backgroundColor = (() => {
    if (isHidden && isWalkable) {
      return 'transparent';
    }

    return hexToRgba(tileColor, opacity);
  })();

  const backgroundImage = (() => {
    if (!isMostlyHidden && isWalkable) {
      return undefined;
    }

    return createGradient(`rgba(27, 27, 27, 0.4)`);
  })();

  return {
    backgroundColor: backgroundColor,
    backgroundImage: backgroundImage,
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: borderColor,
    width: tileSize,
    height: tileSize,
  }
}
/**
 * @param {Number} entityIdx
 * @param {Object} [options]
 * @returns {Object} style
 */
export function createEntityIconStyles(entityIdx, options = {}) {
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
