import {STAT_ID} from 'constants.shared/statIds';
import {TARGET_ID} from 'constants.shared/targetIds';

/** @type {Object} */
const STRING_TO_STAT_MAP = {
  greed: STAT_ID.GREED,
  health: STAT_ID.HEALTH,
  luck: STAT_ID.LUCK,
  movement: STAT_ID.MOVEMENT,
  sanity: STAT_ID.SANITY,
  vision: STAT_ID.VISION,
  candies: STAT_ID.CANDIES,
  tricky: STAT_ID.TRICKY,
  treaty: STAT_ID.TREATY,
  position: STAT_ID.TREATY,

  greedbase: STAT_ID.BASE.GREED,
  healthbase: STAT_ID.BASE.HEALTH,
  luckbase: STAT_ID.BASE.LUCK,
  movementbase: STAT_ID.BASE.MOVEMENT,
  sanitybase: STAT_ID.BASE.SANITY,
  visionbase: STAT_ID.BASE.VISION,

  greeddefault: STAT_ID.DEFAULT.GREED,
  healthdefault: STAT_ID.DEFAULT.HEALTH,
  luckdefault: STAT_ID.DEFAULT.LUCK,
  movementdefault: STAT_ID.DEFAULT.MOVEMENT,
  sanitydefault: STAT_ID.DEFAULT.SANITY,
  visiondefault: STAT_ID.DEFAULT.VISION,
};
/**
 * @param {String} statString
 * @returns {StatId}
 */
export function convertStringToStat(statString) {
  return STRING_TO_STAT_MAP[statString];
}
/** @type {Object} */
const TARGET_TO_STAT_MAP = {
  [TARGET_ID.CHARACTER.CANDIES]: STAT_ID.CANDIES,
  [TARGET_ID.CHARACTER.HEALTH]: STAT_ID.HEALTH,
  [TARGET_ID.CHARACTER.GREED]: STAT_ID.GREED,
  [TARGET_ID.CHARACTER.LUCK]: STAT_ID.LUCK,
  [TARGET_ID.CHARACTER.MOVEMENT]: STAT_ID.MOVEMENT,
  [TARGET_ID.CHARACTER.TRICKY]: STAT_ID.TRICKY,
  [TARGET_ID.CHARACTER.TREATY]: STAT_ID.TREATY,
  [TARGET_ID.CHARACTER.SANITY]: STAT_ID.SANITY,
  [TARGET_ID.CHARACTER.VISION]: STAT_ID.VISION,
};
/**
 * @param {TargetId} targetId
 * @returns {StatId}
 */
export function convertTargetToStat(targetId) {
  return TARGET_TO_STAT_MAP[targetId];
}
