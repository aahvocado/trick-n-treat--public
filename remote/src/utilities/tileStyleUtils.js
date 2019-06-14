import {
  TILE_SIZE,
} from 'constants/styleConstants';

import {TILE_TYPES} from 'constants.shared/tileTypes';

import hexToRgba from 'utilities/hexToRgba';

import * as lightLevelUtils from 'utilities.shared/lightLevelUtils';
import * as tileTypeUtils from 'utilities.shared/tileTypeUtils';

/**
 * maps the TileType to a color
 * @todo - create css
 */
export const TILE_COLOR_MAP = {
  [TILE_TYPES.EMPTY]: '#313131',

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

  // -- debugging styles
  [TILE_TYPES.DEBUG_RED]: '#f44253',
  [TILE_TYPES.DEBUG_ORANGE]: '#ffaa32',
  [TILE_TYPES.DEBUG_YELLOW]: '#f1ff3a',
  [TILE_TYPES.DEBUG_GREEN]: '#4aef55',
  [TILE_TYPES.DEBUG_BLUE]: '#4150f2',
  [TILE_TYPES.DEBUG_INDIGO]: '#4b0082',
  [TILE_TYPES.DEBUG_VIOLET]: '#8A2BE2',
  [TILE_TYPES.DEBUG_BLACK]: '#212020',
  [TILE_TYPES.DEBUG_WHITE]: '#ffffff',

  [TILE_TYPES.DEBUG_WALL_RED]: '#f44253',
  [TILE_TYPES.DEBUG_WALL_ORANGE]: '#ffaa32',
  [TILE_TYPES.DEBUG_WALL_YELLOW]: '#f1ff3a',
  [TILE_TYPES.DEBUG_WALL_GREEN]: '#4aef55',
  [TILE_TYPES.DEBUG_WALL_BLUE]: '#4150f2',
  [TILE_TYPES.DEBUG_WALL_INDIGO]: '#4b0082',
  [TILE_TYPES.DEBUG_WALL_VIOLET]: '#8A2BE2',
  [TILE_TYPES.DEBUG_WALL_BLACK]: '#212020',
  [TILE_TYPES.DEBUG_WALL_WHITE]: '#ffffff',
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
    isHighlighted,
    isTooFar,
    isSelected,
    isMyPosition,
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
    if (isMyPosition) {
      return '#f9e358';
    }

    if (isHighlighted && isTooFar) {
      return '#b7246f';
    }

    if (isHighlighted && isWalkable) {
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

  const boxShadow = (() => {
    if (isSelected && isTooFar) {
      return 'inset 0 0 2px 2px rgba(234,98,98,1)';
    }

    if (isSelected) {
      return 'inset 0 0 3px 3px rgba(255,255,255,1)';
    }

    return undefined;
  })();

  return {
    backgroundColor: backgroundColor,
    backgroundImage: backgroundImage,
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: borderColor,
    width: tileSize,
    height: tileSize,
    boxShadow: boxShadow,
  }
}
/**
 * @param {Number} entityIdx
 * @param {Object} [options]
 * @returns {Object} style
 */
export function createEntityIconStyles(entityIdx, options = {}) {
  const {
    opacity = 1,
  } = options;

  const padding = 5;
  const oddOrEven = entityIdx % 2;
  const iconOffsetX = padding + (TILE_SIZE / 2.2) * oddOrEven;
  const iconOffsetY = padding + (TILE_SIZE / 2.2) * Math.floor(entityIdx / 2);

  return {
    position: 'absolute',
    left: `${iconOffsetX}px`,
    top: `${iconOffsetY}px`,
    opacity: opacity,
  }
}
