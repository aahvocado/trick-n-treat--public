import {FOG_TYPES, TILE_TYPES} from 'constants/tileTypes';

// pixel size of a tile component
export const TILE_SIZE = 50;

export const TILE_STYLES = {
  [TILE_TYPES.START]: { backgroundColor: 'yellow' },
  [TILE_TYPES.EMPTY]: { backgroundColor: '#313131' },
  [TILE_TYPES.PATH]: { backgroundColor: 'lightgreen' },
  [TILE_TYPES.HOUSE]: {
    backgroundColor: '#33c3ff',
    border: '1px solid #299fd0',
  },
  [TILE_TYPES.ENCOUNTER]: { backgroundColor: '#d0ffd0' },
  [TILE_TYPES.SPECIAL]: { backgroundColor: '#da5cff' },
};

export const FOG_STYLES = {
  [FOG_TYPES.HIDDEN]: {},
  [FOG_TYPES.VISIBLE]: {},
  [FOG_TYPES.PARTIAL]: {
    backgroundColor: 'rgb(49, 49, 49, 0.5)',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
};
