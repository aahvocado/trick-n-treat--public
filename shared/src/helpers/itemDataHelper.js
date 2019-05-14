import itemJsonList from 'data.shared/itemData.json';

import arrayContainsArray from 'utilities.shared/arrayContainsArray';
import convertArrayToMap from 'utilities.shared/convertArrayToMap';

/**
 * @type {Array}
 */
export const ITEM_DATA = itemJsonList;
/**
 * caches an object map of the `itemData` so it can be accessed more easily
 */
export const ITEM_DATA_MAP = convertArrayToMap(ITEM_DATA);
/**
 * finds the data for a loaded item by id
 *
 * @param {String} id
 * @returns {Object}
 */
export function getItemDataById(id) {
  return ITEM_DATA_MAP[id];
}
/**
 * finds all items with given Tag
 *
 * @param {TagId} tagId
 * @returns {Array<itemData>}
 */
export function getItemDataWithTag(tagId) {
  return ITEM_DATA.filter((item) =>
    item.tagList.includes(tagId)
  )
}
/**
 * finds all items using options
 *
 * @param {Object} options
 * @property {Array} options.includeTags - one with all of these tags
 * @property {Array} options.excludeTags - one without any of these tags
 * @returns {Array<itemData>}
 */
export function findItemData(options) {
  const {
    includeTags = [],
    excludeTags = [],
  } = options;

  return ITEM_DATA.filter((item) => {
    const doesIncludeTags = arrayContainsArray(item.tagList, includeTags);
    const doesExcludeTags = !arrayContainsArray(item.tagList, excludeTags);
    return doesIncludeTags && doesExcludeTags;
  });
}
