import Joi from '@hapi/joi';

import {DATA_TYPE} from 'constants.shared/dataTypes';

import arrayContainsArray from 'utilities.shared/arrayContainsArray';
import convertObjectToArray from 'utilities.shared/convertObjectToArray';
import * as genericDataUtils from 'utilities.shared/genericDataUtils';

/**
 * here you will find the utility functions that help construct an ItemData object
 *
 * @typedef {Object} ItemData
 */

/** @type {String} */
const idPrefix = 'ITEM_ID';
/**
 * schema for ItemData
 *
 * @type {Joi.Schema}
 */
const itemSchema = Joi.object().keys({
  dataType: Joi.string().required(),
  id: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  isUseable: Joi.boolean().required(),
  isConsumable: Joi.boolean().required(),
  isKeyItem: Joi.boolean().required(),
  isGeneratable: Joi.boolean(),
  isKeyItem: Joi.boolean().required(),
  tagList: Joi.array().optional(),
  triggerList: Joi.array().optional(),
  conditionList: Joi.array().optional(),
});
/**
 * @param {Object} data
 * @returns {Boolean}
 */
export function validateItem(data) {
  const validation = Joi.validate(data, itemSchema);

  // valid if null
  if (validation.error === null) {
    return true;
  }

  console.warn(validation.error);
  return false;
}
/**
 * @param {Object} [defaultData]
 * @returns {ItemData}
 */
export function createItemData(defaultData = {}) {
  const blankTemplate = {
    dataType: DATA_TYPE.ITEM,
    id: `${idPrefix}.NEW`,
    name: undefined,
    description: undefined,
    isUseable: true,
    isConsumable: true,
    isKeyItem: false,
    // tagList: [],
    // triggerList: [],
    // conditionList: [],
    isGeneratable: true,
    // rarityId: undefined,
  };

  return updateItemData(blankTemplate, defaultData);
}
/**
 * @param {ItemData} data
 * @param {Object} changes
 * @returns {ItemData}
 */
export function updateItemData(data, changes) {
  const resultData = {
    ...data,
    ...changes,
    id: formatId(changes.id || data.id),
  };

  return resultData;
}
/**
 * formats ItemData
 * - removes empty optional Arrays
 * - removes undefined from optional properties
 * - orders the properties (in an arbitrary way that I like)
 *
 * @param {ItemData} data
 * @returns {ItemData}
 */
export function formatItemData(data) {
  // put the data in order
  let formattedData = {
    dataType: data.dataType,
    id: data.id,
    name: data.name,
    description: data.description,
    isUseable: data.isUseable,
    isConsumable: data.isConsumable,
    isKeyItem: data.isKeyItem,
    tagList: data.tagList || [],
    triggerList: genericDataUtils.formatTriggerList(data.triggerList),
    conditionList: genericDataUtils.formatConditionList(data.conditionList),
    isGeneratable: data.isGeneratable,
    rarityId: data.rarityId,
  }

  // remove empty optional arrays
  if (formattedData.tagList.length <= 0) {
    delete formattedData.tagList;
  }

  if (formattedData.triggerList.length <= 0) {
    delete formattedData.triggerList;
  }

  if (formattedData.conditionList.length <= 0) {
    delete formattedData.conditionList;
  }

  // all done
  return formattedData;
}
/**
 * @param {Array<ItemData>} itemList
 * @returns {Array<ItemData>}
 */
export function formatItemList(itemList) {
  return itemList.map(formatItemData);
}
/**
 * removes the idPrefix
 *
 * @param {String} idString
 * @returns {String}
 */
export function snipIdPrefix(idString) {
  // if it doesn't have the prefix we don't have to remove it
  const split = idString.split('.');
  if (split[0] !== idPrefix) {
    return idString;
  }

  split.splice(0, 1);
  return split.join();
}
/**
 * formats the given id string
 * - no white space
 * - all uppercase
 *
 * @param {String} idString
 * @returns {String}
 */
export function formatId(idString) {
  // remove white space and set to uppercase
  const formattedString = idString.replace(/ /g,'').toUpperCase();

  // return formatted string if it already has the prefix
  const split = formattedString.split('.');
  if (split[0] === idPrefix) {
    return formattedString;
  }

  // need to add the prefix
  return idPrefix + '.' + formattedString;
}
