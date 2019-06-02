import {TARGET_ID} from 'constants.shared/targetIds';
import {TRIGGER_LOGIC_ID} from 'constants.shared/triggerLogicIds';

import * as itemDataHelper from 'helpers.shared/itemDataHelper';

import ItemModel from 'models.shared/ItemModel';

import logger from 'utilities/logger.game';

import * as statUtils from 'utilities.shared/statUtils';
import * as triggerLogicUtils from 'utilities.shared/triggerLogicUtils';
import * as targetUtils from 'utilities.shared/targetUtils';

/**
 * resolves an individual TriggerData for the character
 *
 * @param {TriggerData} triggerData
 * @param {CharacterModel} characterModel
 */
export function resolveTrigger(triggerData, characterModel) {
  const {
    triggerLogicId,
    targetId,
  } = triggerData;
  logger.verbose(`. [[resolving trigger "${triggerLogicId}" targeting "${targetId}"]]`);

  // get the function that will do the work of making the trigger work
  const logicFunction = handleGetLogicFunction(triggerData);

  // get the parameter that we will pass into the `logicFunction`
  const targetParameter = targetUtils.handleGetTargetParameter(targetId, characterModel);

  // get the function that will make the actual change with the trigger
  const applyFunction = handleGetApplyFunction(triggerData, characterModel);

  // use the target on the logic and then apply what we get to the target
  const resultValue = logicFunction(targetParameter);
  applyFunction(resultValue);
}
// -- logic functions
/**

 * @param {TriggerData} triggerData
 * @param {CharacterModel} characterModel
 * @returns {Function}
 */
export function handleGetLogicFunction(triggerData, characterModel) {
  const {
    triggerLogicId,
  } = triggerData;

  if (triggerLogicId === TRIGGER_LOGIC_ID.GIVE) {
    return getGiveLogicFunction(triggerData);
  }

  if (triggerLogicId === TRIGGER_LOGIC_ID.TAKE) {
    return getTakeLogicFunction(triggerData);
  }

  if (triggerLogicUtils.isAddTriggerLogic(triggerLogicId)) {
    return getAddLogicFunction(triggerData);
  }

  if (triggerLogicUtils.isSubtractTriggerLogic(triggerLogicId)) {
    return getAddLogicFunction(triggerData);
  }
}
/**
 * @param {TriggerData} triggerData
 * @returns {Function}
 */
export function getAddLogicFunction(triggerData) {
  const {
    value,
  } = triggerData;

  return (targetValue) => {
    return targetValue + value;
  };
}
/**
 * @param {TriggerData} triggerData
 * @returns {Function}
 */
export function getSubtractLogicFunction(triggerData) {
  const {
    value,
  } = triggerData;

  return (targetValue) => {
    return targetValue - value;
  };
}
/**
 * @param {TriggerData} triggerData
 * @returns {Function}
 */
export function getGiveLogicFunction(triggerData) {
  const {
    itemId,
    targetId,
    value,
  } = triggerData;

  if (targetId !== TARGET_ID.ITEM.ALL) {
    logger.warning('How are you not giving an Item?');
    return;
  }

  // find data attributes
  const itemData = itemDataHelper.getItemDataById(itemId);
  if (itemData === undefined) {
    logger.warning(`Attempting to give item but failed to find "${itemId}".`);
    return;
  }

  // make a model to give
  const createdItemModel = new ItemModel({
    ...itemData,
    quantity: value,
  });

  return (inventory) => {
    inventory.push(createdItemModel);
    return inventory;
  };
}
/**
 * @param {TriggerData} triggerData
 * @returns {Function}
 */
export function getTakeLogicFunction(triggerData) {
  const {
    itemId,
    targetId,
  } = triggerData;

  if (targetId !== TARGET_ID.ITEM.ALL) {
    logger.warning('How are you not taking an Item?');
    return;
  }

  return (inventory) => {
    const foundItemIdx = inventory.findIndex((inventoryItem) => (inventoryItem.get('id') === itemId));

    // not found
    if (foundItemIdx <= 0) {
      return [];
    }

    // grab the actual ItemModel and its quantity
    const exactItemModel = inventory[foundItemIdx];
    const itemQuantity = exactItemModel.get('quantity');

    // if there will be none left, remove it
    if (itemQuantity <= 1) {
      inventory.splice(foundItemIdx, 1);
      return inventory;
    }

    // otherwise we can just subtract one from the item's quantity
    if (itemQuantity > 1) {
      exactItemModel.set({quantity: itemQuantity - 1});
    }

    return inventory;
  };
}
// -- application functions
/**
 * @param {TriggerData} triggerData
 * @param {CharacterModel} characterModel
 * @returns {Function}
 */
export function handleGetApplyFunction(triggerData, characterModel) {
  const {
    targetId,
  } = triggerData;

  if (targetId === TARGET_ID.ITEM.ALL) {
    return (newInventory) => {
      characterModel.set({inventory: newInventory});
    };
  }

  if (targetUtils.isCharacterTarget(targetId)) {
    return getStatApplyFunction(targetId, characterModel);
  }
}
/**
 * @param {TargetId} targetId
 * @param {CharacterModel} characterModel
 * @returns {Function}
 */
export function getStatApplyFunction(targetId, characterModel) {
  const statId = statUtils.convertTargetToStat(targetId);
  return (resultValue) => (characterModel.setStatById(statId, resultValue));
}
