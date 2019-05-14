import convertObjectToArray from 'utilities.shared/convertObjectToArray';

/**
 * @typedef {String} TriggerId
 */

export const TRIGGER_ID = {
  // -- items
  GIVE_ITEM: 'TRIGGER_ID.GIVE_ITEM',

  // -- stats
  CANDY: {
    ADD: 'TRIGGER_ID.CANDY.ADD',
    SUBTRACT: 'TRIGGER_ID.CANDY.SUBTRACT',
  },

  HEALTH: {
    ADD: 'TRIGGER_ID.HEALTH.ADD',
    SUBTRACT: 'TRIGGER_ID.HEALTH.SUBTRACT',
  },

  MOVEMENT: {
    ADD: 'TRIGGER_ID.MOVEMENT.ADD',
    SUBTRACT: 'TRIGGER_ID.MOVEMENT.SUBTRACT',
  },

  SANITY: {
    ADD: 'TRIGGER_ID.SANITY.ADD',
    SUBTRACT: 'TRIGGER_ID.SANITY.SUBTRACT',
  },

  VISION: {
    ADD: 'TRIGGER_ID.VISION.ADD',
    SUBTRACT: 'TRIGGER_ID.VISION.SUBTRACT',
  },

  LUCK: {
    ADD: 'TRIGGER_ID.LUCK.ADD',
    SUBTRACT: 'TRIGGER_ID.LUCK.SUBTRACT',
  },

  GREED: {
    ADD: 'TRIGGER_ID.GREED.ADD',
    SUBTRACT: 'TRIGGER_ID.GREED.SUBTRACT',
  },

  // -- locational
  CHANGE_POSITION: 'TRIGGER_ID.CHANGE_POSITION',
};
export const TRIGGER_ID_LIST = convertObjectToArray(TRIGGER_ID);
