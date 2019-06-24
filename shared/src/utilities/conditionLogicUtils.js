import {
  CONDITION_LOGIC_ID,
  ITEM_CONDITION_LOGIC_ID_LIST,
  NUMBER_CONDITION_LOGIC_ID_LIST,
  POINT_CONDITION_LOGIC_ID_LIST,
  TILETYPE_CONDITION_LOGIC_ID_LIST,
} from 'constants.shared/conditionLogicIds';

/**
 * determines which Logic Function to use and then returns it
 *
 * @param {ConditionData} conditionData
 * @returns {Function}
 */
export function handleGetLogicFunction(conditionData) {
  const {conditionLogicId} = conditionData;

  if (isItemConditionLogic(conditionLogicId)) {
    return getItemLogicFunction(conditionData);
  }

  if (isNumberConditionLogic(conditionLogicId)) {
    return getNumberLogicFunction(conditionData);
  }

  if (isPointConditionLogic(conditionData)) {
    // return getItemLogicFunction(conditionData);
  }

  if (isTileIdConditionLogic(conditionData)) {
    // return getItemLogicFunction(conditionData);
  }
}
/**
 * returns a Function that takes in an Inventory Array
 *  and determines if it passes condition
 *
 * @param {ConditionData} conditionData
 * @returns {Function}
 */
export function getItemLogicFunction(conditionData) {
  const {
    conditionLogicId,
    itemId,
  } = conditionData;

  if (conditionLogicId === CONDITION_LOGIC_ID.HAS_ITEM) {
    return (inventoryList) => {
      const matchingItem = inventoryList.find((itemModel) => (itemModel.get('id') === itemId));
      return matchingItem !== undefined;
    };
  }

  if (conditionLogicId === CONDITION_LOGIC_ID.DOES_NOT_HAVE_ITEM) {
    return (inventoryList) => {
      const matchingItem = inventoryList.find((itemModel) => (itemModel.get('id') === itemId));
      return matchingItem === undefined;
    };
  }
}
/**
 * returns a Function that takes in a Number parameter
 *  and determines if it passes condition
 *
 * @param {ConditionData} conditionData
 * @returns {Function}
 */
export function getNumberLogicFunction(conditionData) {
  const {
    conditionLogicId,
    value,
  } = conditionData;

  if (conditionLogicId === CONDITION_LOGIC_ID.EQUALS) {
    return (targetValue) => (targetValue === value);
  }

  if (conditionLogicId === CONDITION_LOGIC_ID.LESS_THAN) {
    return (targetValue) => (targetValue < value);
  }

  if (conditionLogicId === CONDITION_LOGIC_ID.GREATER_THAN) {
    return (targetValue) => (targetValue > value);
  }
}
// -- basic utilities
/**
 * does condition depend on an Item
 *
 * @param {ConditionLogicId} conditionLogicId
 * @returns {Boolean}
 */
export function isItemConditionLogic(conditionLogicId) {
  return ITEM_CONDITION_LOGIC_ID_LIST.includes(conditionLogicId);
}
/**
 * does condition depend on a Number
 *
 * @param {ConditionLogicId} conditionLogicId
 * @returns {Boolean}
 */
export function isNumberConditionLogic(conditionLogicId) {
  return NUMBER_CONDITION_LOGIC_ID_LIST.includes(conditionLogicId);
}
/**
 * does condition depend on a Point
 *
 * @param {ConditionLogicId} conditionLogicId
 * @returns {Boolean}
 */
export function isPointConditionLogic(conditionLogicId) {
  return POINT_CONDITION_LOGIC_ID_LIST.includes(conditionLogicId);
}
/**
 * does condition depend on a TileId
 *
 * @param {ConditionLogicId} conditionLogicId
 * @returns {Boolean}
 */
export function isTileIdConditionLogic(conditionLogicId) {
  return TILETYPE_CONDITION_LOGIC_ID_LIST.includes(conditionLogicId);
}
