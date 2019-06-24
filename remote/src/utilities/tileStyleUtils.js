import {TILE_SIZE} from 'constants/styleConstants';

import {TILE_ID} from 'constants.shared/tileIds';

import hexToRgba from 'utilities/hexToRgba';

import * as lightLevelUtils from 'utilities.shared/lightLevelUtils';
import * as tileUtils from 'utilities.shared/tileUtils';

/**
 * maps the TileId to a color
 * @todo - create css
 */
export const TILE_COLOR_MAP = {
  [TILE_ID.EMPTY]: '#313131',
  [TILE_ID.EMPTY_WALL]: '#313131',
  //
  [TILE_ID.DEBUG.BLACK]: '#313131',
  [TILE_ID.DEBUG.BLACK_WALL]: '#313131',
  [TILE_ID.DEBUG.GRAY]: '#dddddd',
  [TILE_ID.DEBUG.GRAY_WALL]: '#dddddd',
  [TILE_ID.DEBUG.WHITE]: '#ffffff',
  [TILE_ID.DEBUG.WHITE_WALL]: '#ffffff',
  [TILE_ID.DEBUG.RED]: '#f44253',
  [TILE_ID.DEBUG.RED_WALL]: '#f44253',
  [TILE_ID.DEBUG.ORANGE]: '#ffaa32',
  [TILE_ID.DEBUG.ORANGE_ORANGE]: '#ffaa32',
  [TILE_ID.DEBUG.YELLOW]: '#f1ff3a',
  [TILE_ID.DEBUG.YELLOW_WALL]: '#f1ff3a',
  [TILE_ID.DEBUG.GREEN]: '#4aef55',
  [TILE_ID.DEBUG.GREEN_WALL]: '#4aef55',
  [TILE_ID.DEBUG.BLUE]: '#4150f2',
  [TILE_ID.DEBUG.BLUE_WALL]: '#4150f2',
  [TILE_ID.DEBUG.INDIGO]: '#4b0082',
  [TILE_ID.DEBUG.INDIGO_WALL]: '#4b0082',
  [TILE_ID.DEBUG.VIOLET]: '#8A2BE2',
  [TILE_ID.DEBUG.VIOLET_WALL]: '#8A2BE2',
  [TILE_ID.DEBUG.PINK]: '#ffdddd',
  [TILE_ID.DEBUG.PINK_WALL]: '#ffdddd',
  [TILE_ID.DEBUG.PEACH]: '#ffce89',
  [TILE_ID.DEBUG.PEACH_WALL]: '#ffce89',
  [TILE_ID.DEBUG.LIME]: '#e1fc92',
  [TILE_ID.DEBUG.LIME_WALL]: '#e1fc92',
  [TILE_ID.DEBUG.MOSS]: '#9abc9f',
  [TILE_ID.DEBUG.MOSS_WALL]: '#9abc9f',
  [TILE_ID.DEBUG.SKY]: '#d1fffe',
  [TILE_ID.DEBUG.SKY_WALL]: '#d1fffe',
  [TILE_ID.DEBUG.DENIM]: '#717bb7',
  [TILE_ID.DEBUG.DENIM_WALL]: '#717bb7',
  [TILE_ID.DEBUG.SAND]: '#e2d0b3',
  [TILE_ID.DEBUG.SAND_WALL]: '#e2d0b3',
  [TILE_ID.DEBUG.COFFEE]: '#6d6558',
  [TILE_ID.DEBUG.COFFEE_WALL]: '#6d6558',
  [TILE_ID.DEBUG.CHOCOLATE]: '#49330e',
  [TILE_ID.DEBUG.CHOCOLATE_WALL]: '#49330e',

  //
  [TILE_ID.HOME.HOUSE]: '#f2a137',
  [TILE_ID.HOME.HOUSE_WALL]: '#f2a137',
  [TILE_ID.HOME.SIDEWALK]: '#b4d2cb',
  [TILE_ID.HOME.SIDEWALK_WALL]: '#b4d2cb',
  [TILE_ID.HOME.ROAD]: '#607e8a',
  [TILE_ID.HOME.ROAD_WALL]: '#607e8a',
  [TILE_ID.HOME.LAWN]: '#93e677',
  [TILE_ID.HOME.LAWN_WALL]: '#93e677',
  [TILE_ID.HOME.STREETLAMP]: '#dbfff7',
  [TILE_ID.HOME.STREETLAMP_WALL]: '#dbfff7',

  [TILE_ID.HOME.HOUSE2]: '#f2a137',
  [TILE_ID.HOME.HOUSE2_WALL]: '#f2a137',
  [TILE_ID.HOME.SIDEWALK2]: '#b4d2cb',
  [TILE_ID.HOME.SIDEWALK2_WALL]: '#b4d2cb',
  [TILE_ID.HOME.ROAD2]: '#607e8a',
  [TILE_ID.HOME.ROAD2_WALL]: '#607e8a',
  [TILE_ID.HOME.LAWN2]: '#93e677',
  [TILE_ID.HOME.LAWN2_WALL]: '#93e677',
  [TILE_ID.HOME.STREETLAMP2]: '#dbfff7',
  [TILE_ID.HOME.STREETLAMP2_WALL]: '#dbfff7',

  [TILE_ID.HOME.HOUSE3]: '#f2a137',
  [TILE_ID.HOME.HOUSE3_WALL]: '#f2a137',
  [TILE_ID.HOME.SIDEWALK3]: '#b4d2cb',
  [TILE_ID.HOME.SIDEWALK3_WALL]: '#b4d2cb',
  [TILE_ID.HOME.ROAD3]: '#607e8a',
  [TILE_ID.HOME.ROAD3_WALL]: '#607e8a',
  [TILE_ID.HOME.LAWN3]: '#93e677',
  [TILE_ID.HOME.LAWN3_WALL]: '#93e677',
  [TILE_ID.HOME.STREETLAMP3]: '#dbfff7',
  [TILE_ID.HOME.STREETLAMP3_WALL]: '#dbfff7',

  //
  [TILE_ID.PARK.GRASS]: '#5dd499',
  [TILE_ID.PARK.GRASS_WALL]: '#5dd499',
  [TILE_ID.PARK.FLOWERS]: '#e67fd4',
  [TILE_ID.PARK.FLOWERS_WALL]: '#e67fd4',
  [TILE_ID.PARK.BENCH]: '#69716c',
  [TILE_ID.PARK.BENCH_WALL]: '#69716c',
  [TILE_ID.PARK.BUSH]: '#338a43',
  [TILE_ID.PARK.BUSH_WALL]: '#338a43',
  [TILE_ID.PARK.TREE]: '#1b4623',
  [TILE_ID.PARK.TREE_WALL]: '#1b4623',
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
  return t<.6 ? 8*t*t*t*t : 1-8*(--t)*t*t*t;
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
    tile,
  } = options;

  // calculate some values
  const isWalkable = tileUtils.isWalkableTile(tile);
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
  const tileColor = TILE_COLOR_MAP[tile];
  const backgroundColor = (() => {
    if (isHidden) {
      return TILE_COLOR_MAP[TILE_ID.EMPTY];
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
