import {
  ITEM_TRIGGER_ID_LIST,
  NUMBER_TRIGGER_ID_LIST,
  POINT_TRIGGER_ID_LIST,
  ADD_TRIGGER_ID_LIST,
  SUBTRACT_TRIGGER_ID_LIST,
} from 'constants.shared/triggerIds';

/**
 * does trigger use an ItemId
 *
 * @param {TriggerId} triggerId
 * @returns {Boolean}
 */
export function doesTriggerItem(triggerId) {
  return ITEM_TRIGGER_ID_LIST.includes(triggerId);
}
/**
 * does trigger simply just change a Number?
 *
 * @param {TriggerId} triggerId
 * @returns {Boolean}
 */
export function doesTriggerNumber(triggerId) {
  return NUMBER_TRIGGER_ID_LIST.includes(triggerId);
}
/**
 * @param {TriggerId} triggerId
 * @returns {Boolean}
 */
export function isAddTrigger(triggerId) {
  return ADD_TRIGGER_ID_LIST.includes(triggerId);
}
/**
 * @param {TriggerId} triggerId
 * @returns {Boolean}
 */
export function isSubtractTrigger(triggerId) {
  return SUBTRACT_TRIGGER_ID_LIST.includes(triggerId);
}
