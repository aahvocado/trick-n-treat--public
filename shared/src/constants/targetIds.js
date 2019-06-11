import convertObjectToArray from 'utilities.shared/convertObjectToArray';

/**
 * @typedef {String} TargetId
 */
export const TARGET_ID = {
  CHARACTER: {
    CANDIES: 'TARGET_ID.CHARACTER.CANDIES',
    HEALTH: 'TARGET_ID.CHARACTER.HEALTH',
    GREED: 'TARGET_ID.CHARACTER.GREED',
    LUCK: 'TARGET_ID.CHARACTER.LUCK',
    MOVEMENT: 'TARGET_ID.CHARACTER.MOVEMENT',
    TRICKY: 'TARGET_ID.CHARACTER.TRICKY',
    TREATY: 'TARGET_ID.CHARACTER.TREATY',
    SANITY: 'TARGET_ID.CHARACTER.SANITY',
    VISION: 'TARGET_ID.CHARACTER.VISION',
  },

  ENCOUNTER: {
    CHARACTER_TRIGGER_COUNT: 'TARGET_ID.ENCOUNTER.CHARACTER_TRIGGER_COUNT',
    CHARACTER_TRICK_COUNT: 'TARGET_ID.ENCOUNTER.CHARACTER_TRICK_COUNT',
    CHARACTER_TREAT_COUNT: 'TARGET_ID.ENCOUNTER.CHARACTER_TREAT_COUNT',

    TOTAL_VISITORS: 'TARGET_ID.ENCOUNTER.TOTAL_VISITORS',
    TOTAL_TRICKS: 'TARGET_ID.ENCOUNTER.TOTAL_TRICKS',
    TOTAL_TREATS: 'TARGET_ID.ENCOUNTER.TOTAL_TREATS',

    UNIQUE_VISITORS: 'TARGET_ID.ENCOUNTER.UNIQUE_VISITORS',
    UNIQUE_TRICKS: 'TARGET_ID.ENCOUNTER.UNIQUE_TRICKS',
    UNIQUE_TREATS: 'TARGET_ID.ENCOUNTER.UNIQUE_TREATS',
  },

  ITEM: {
    ALL: 'TARGET_ID.ITEM.ALL',
  },
};
/** @type {Array<TargetId>} */
export const TARGET_ID_LIST = convertObjectToArray(TARGET_ID, {flatten: true});
/**
 * list of all targets that depend on a Character
 */
export const CHARACTER_TARGET_ID_LIST = [
  TARGET_ID.CHARACTER.CANDIES,
  TARGET_ID.CHARACTER.HEALTH,
  TARGET_ID.CHARACTER.GREED,
  TARGET_ID.CHARACTER.LUCK,
  TARGET_ID.CHARACTER.MOVEMENT,
  TARGET_ID.CHARACTER.TRICKY,
  TARGET_ID.CHARACTER.TREATY,
  TARGET_ID.CHARACTER.VISION,
  TARGET_ID.CHARACTER.SANITY,
];
/**
 * list of all targets that depend on an Encounter
 */
export const ENCOUNTER_TARGET_ID_LIST = [
  TARGET_ID.ENCOUNTER.TOTAL_VISITORS,
  TARGET_ID.ENCOUNTER.TOTAL_TRICKS,
  TARGET_ID.ENCOUNTER.TOTAL_TREATS,
  TARGET_ID.ENCOUNTER.UNIQUE_VISITORS,
  TARGET_ID.ENCOUNTER.UNIQUE_TRICKS,
  TARGET_ID.ENCOUNTER.UNIQUE_TREATS,
  TARGET_ID.ENCOUNTER.CHARACTER_TRIGGER_COUNT,
  TARGET_ID.ENCOUNTER.CHARACTER_TRICK_COUNT,
  TARGET_ID.ENCOUNTER.CHARACTER_TREAT_COUNT,
];
/**
 *
 */
export const NUMBER_TARGET_ID_LIST = [
  TARGET_ID.CHARACTER.CANDIES,
  TARGET_ID.CHARACTER.HEALTH,
  TARGET_ID.CHARACTER.GREED,
  TARGET_ID.CHARACTER.LUCK,
  TARGET_ID.CHARACTER.MOVEMENT,
  TARGET_ID.CHARACTER.TRICKY,
  TARGET_ID.CHARACTER.TREATY,
  TARGET_ID.CHARACTER.VISION,
  TARGET_ID.CHARACTER.SANITY,
  TARGET_ID.ENCOUNTER.TOTAL_VISITORS,
  TARGET_ID.ENCOUNTER.TOTAL_TRICKS,
  TARGET_ID.ENCOUNTER.TOTAL_TREATS,
  TARGET_ID.ENCOUNTER.UNIQUE_VISITORS,
  TARGET_ID.ENCOUNTER.UNIQUE_TRICKS,
  TARGET_ID.ENCOUNTER.UNIQUE_TREATS,
  TARGET_ID.ENCOUNTER.CHARACTER_TRIGGER_COUNT,
  TARGET_ID.ENCOUNTER.CHARACTER_TRICK_COUNT,
  TARGET_ID.ENCOUNTER.CHARACTER_TREAT_COUNT,
];
/**
 * Targets that work for Triggers
 */
export const TRIGGER_TARGET_ID_LIST = [
  TARGET_ID.CHARACTER.CANDIES,
  TARGET_ID.CHARACTER.HEALTH,
  TARGET_ID.CHARACTER.GREED,
  TARGET_ID.CHARACTER.LUCK,
  TARGET_ID.CHARACTER.MOVEMENT,
  TARGET_ID.CHARACTER.TRICKY,
  TARGET_ID.CHARACTER.TREATY,
  TARGET_ID.CHARACTER.VISION,
  TARGET_ID.CHARACTER.SANITY,

  TARGET_ID.ITEM.ALL,
];
/**
 * Targets that work for Conditions
 */
export const CONDITION_TARGET_ID_LIST = [
  TARGET_ID.CHARACTER.CANDIES,
  TARGET_ID.CHARACTER.HEALTH,
  TARGET_ID.CHARACTER.GREED,
  TARGET_ID.CHARACTER.LUCK,
  TARGET_ID.CHARACTER.MOVEMENT,
  TARGET_ID.CHARACTER.TRICKY,
  TARGET_ID.CHARACTER.TREATY,
  TARGET_ID.CHARACTER.VISION,
  TARGET_ID.CHARACTER.SANITY,

  TARGET_ID.ITEM.ALL,

  TARGET_ID.ENCOUNTER.TOTAL_VISITORS,
  TARGET_ID.ENCOUNTER.TOTAL_TRICKS,
  TARGET_ID.ENCOUNTER.TOTAL_TREATS,

  TARGET_ID.ENCOUNTER.UNIQUE_VISITORS,
  TARGET_ID.ENCOUNTER.UNIQUE_TRICKS,
  TARGET_ID.ENCOUNTER.UNIQUE_TREATS,

  TARGET_ID.ENCOUNTER.CHARACTER_TRIGGER_COUNT,
  TARGET_ID.ENCOUNTER.CHARACTER_TRICK_COUNT,
  TARGET_ID.ENCOUNTER.CHARACTER_TREAT_COUNT,
];
