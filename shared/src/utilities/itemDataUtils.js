import {DATA_TYPE} from 'constants.shared/dataTypes';

/**
 * @todo - json validation
 *
 * @typedef {Object} ItemData
 * @property {String} ItemData.dataType
 * @property {String} ItemData.id
 * @property {String} ItemData.title
 * @property {String} ItemData.content
 * @property {Array<TagData>} ItemData.tagList
 * @property {Array<TriggerData>} ItemData.tagList
 */

const idPrefix = 'ITEM_ID';

/**
 * @returns {ItemData}
 */
export function getBlankTemplate() {
  return {
    dataType: DATA_TYPE.ITEM,
    id: `${idPrefix}.NEW`,
    isConsumable: false,
    isKeyItem: false,
    name: '',
    description: '',
    conditionList: [],
    tagList: [],
    triggerList: [],
  }
}
// -- formatters
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
