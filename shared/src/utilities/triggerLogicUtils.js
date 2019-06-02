import {
  ADD_TRIGGER_LOGIC_ID_LIST,
  ITEM_TRIGGER_LOGIC_ID_LIST,
  NUMBER_TRIGGER_LOGIC_ID_LIST,
  POINT_TRIGGER_LOGIC_ID_LIST,
  STAT_TRIGGER_LOGIC_ID_LIST,
  SUBTRACT_TRIGGER_LOGIC_ID_LIST,
} from 'constants.shared/triggerLogicIds';

/**
 * @param {TriggerLogicId} triggerLogicId
 * @returns {Boolean}
 */
export function isAddTriggerLogic(triggerLogicId) {
  return ADD_TRIGGER_LOGIC_ID_LIST.includes(triggerLogicId);
}
/**
 * @param {TriggerLogicId} triggerLogicId
 * @returns {Boolean}
 */
export function isItemTriggerLogic(triggerLogicId) {
  return ITEM_TRIGGER_LOGIC_ID_LIST.includes(triggerLogicId);
}
/**
 * @param {TriggerLogicId} triggerLogicId
 * @returns {Boolean}
 */
export function isNumberTriggerLogic(triggerLogicId) {
  return NUMBER_TRIGGER_LOGIC_ID_LIST.includes(triggerLogicId);
}
/**
 * @param {TriggerLogicId} triggerLogicId
 * @returns {Boolean}
 */
export function isPointTriggerLogic(triggerLogicId) {
  return POINT_TRIGGER_LOGIC_ID_LIST.includes(triggerLogicId);
}
/**
 * @param {TriggerLogicId} triggerLogicId
 * @returns {Boolean}
 */
export function isStatTriggerLogic(triggerLogicId) {
  return STAT_TRIGGER_LOGIC_ID_LIST.includes(triggerLogicId);
}
/**
 * @param {TriggerLogicId} triggerLogicId
 * @returns {Boolean}
 */
export function isSubtractTriggerLogic(triggerLogicId) {
  return SUBTRACT_TRIGGER_LOGIC_ID_LIST.includes(triggerLogicId);
}
