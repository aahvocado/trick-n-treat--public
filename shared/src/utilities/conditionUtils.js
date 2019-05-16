import {
  ITEM_CONDITION_ID_LIST,
  NUMBER_CONDITION_ID_LIST,
  POINT_CONDITION_ID_LIST,
  TILETYPE_CONDITION_ID_LIST,
} from 'constants.shared/conditionIds';

/**
 * does condition depend on an Item
 *
 * @param {ConditionId} conditionId
 * @returns {Boolean}
 */
export function isItemCondition(conditionId) {
  return ITEM_CONDITION_ID_LIST.includes(conditionId);
}
/**
 * does condition depend on a Number
 *
 * @param {ConditionId} conditionId
 * @returns {Boolean}
 */
export function isNumberCondition(conditionId) {
  return NUMBER_CONDITION_ID_LIST.includes(conditionId);
}
/**
 * does condition depend on a Point
 *
 * @param {ConditionId} conditionId
 * @returns {Boolean}
 */
export function isPointCondition(conditionId) {
  return POINT_CONDITION_ID_LIST.includes(conditionId);
}
/**
 * does condition depend on a TileType
 *
 * @param {ConditionId} conditionId
 * @returns {Boolean}
 */
export function isTileTypeCondition(conditionId) {
  return TILETYPE_CONDITION_ID_LIST.includes(conditionId);
}
