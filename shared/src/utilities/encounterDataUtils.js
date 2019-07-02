import Joi from '@hapi/joi';

import {DATA_TYPE} from 'constants.shared/dataTypes';

import arrayContainsArray from 'utilities.shared/arrayContainsArray';
import convertObjectToArray from 'utilities.shared/convertObjectToArray';
import * as genericDataUtils from 'utilities.shared/genericDataUtils';

/**
 * here you will find the utility functions that help construct an EncounterData object
 *
 * @typedef {Object} EncounterData
 */

/** @type {String} */
const idPrefix = 'ENCOUNTER_ID';
/**
 * schema for EncounterData
 *
 * @type {Joi.Schema}
 */
const encounterSchema = Joi.object().keys({
  dataType: Joi.string().required(),
  id: Joi.string().required(),
  title: Joi.string().required(),
  content: Joi.string().required(),
  actionList: Joi.array().min(1).required(),
  tagList: Joi.array().optional(),
  triggerList: Joi.array().optional(),
  conditionList: Joi.array().optional(),

  isDialogue: Joi.boolean().required(),
  isImmediate: Joi.boolean().optional(),
  isGeneratable: Joi.boolean().required(),
  isGeneratableOnce: Joi.boolean().optional(),
  rarityId: Joi.string().optional(),
  tileList: Joi.array().optional(),

  groupId: Joi.string().optional(),
});
/**
 * @param {Object} data
 * @returns {Boolean}
 */
export function validateEncounter(data) {
  const validation = Joi.validate(data, encounterSchema);

  // valid if null
  if (validation.error === null) {
    return true;
  }

  console.warn(validation.error);
  return false;
}
/**
 * @param {Object} [defaultData]
 * @returns {EncounterData}
 */
export function createEncounterData(defaultData = {}) {
  const blankTemplate = {
    dataType: DATA_TYPE.ENCOUNTER,
    id: `${idPrefix}.NEW`,
    title: undefined,
    content: undefined,
    isDialogue: false,
    isImmediate: false,
    actionList: [genericDataUtils.createActionData()],
    // tagList: [],
    // triggerList: [],
    // conditionList: [],
    isGeneratable: true,
    // isGeneratableOnce: true,
    // rarityId: undefined,
    // groupId: undefined,
  };

  return updateEncounterData(blankTemplate, defaultData);
}
/**
 * @param {EncounterData} data
 * @param {Object} changes
 * @returns {EncounterData}
 */
export function updateEncounterData(data, changes) {
  const resultData = {
    ...data,
    ...changes,
    id: formatId(changes.id || data.id),
  };

  return resultData;
}
/**
 * formats EncounterData
 * - removes empty optional Arrays
 * - removes undefined from optional properties
 * - orders the properties (in an arbitrary way that I like)
 *
 * @param {EncounterData} data
 * @returns {EncounterData}
 */
export function formatEncounterData(data) {
  // put the data in order
  const formattedData = {
    dataType: data.dataType,
    id: data.id,
    title: data.title,
    content: data.content,
    isDialogue: data.isDialogue,
    isImmediate: data.isImmediate,
    tagList: data.tagList || [],
    actionList: genericDataUtils.formatActionList(data.actionList),
    triggerList: genericDataUtils.formatTriggerList(data.triggerList),
    conditionList: genericDataUtils.formatConditionList(data.conditionList),
    isGeneratable: data.isGeneratable,
    isGeneratableOnce: data.isGeneratableOnce,
    rarityId: data.rarityId,
    tileList: data.tileList,
    groupId: data.groupId || '',
  };

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

  // remove blank optional strings
  if (formattedData.groupId.length <= 0) {
    delete formattedData.groupId;
  }

  // if this is not Generatable
  if (!formattedData.isGeneratable) {
    // it does not need `isGeneratableOnce`
    if (formattedData.isGeneratableOnce) {
      delete formattedData.isGeneratableOnce;
    }

    // it does not need `rarityId`
    if (formattedData.rarityId) {
      delete formattedData.rarityId;
    }
  }

  // all done
  return formattedData;
}
/**
 * @param {Array<EncounterData>} encounterList
 * @returns {Array<EncounterData>}
 */
export function formatEncounterList(encounterList) {
  return encounterList.map(formatEncounterData);
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
  const formattedString = idString.replace(/ /g, '').toUpperCase();

  // return formatted string if it already has the prefix
  const split = formattedString.split('.');
  if (split[0] === idPrefix) {
    return formattedString;
  }

  // need to add the prefix
  return idPrefix + '.' + formattedString;
}
/**
 * maps each EncounterData into Groups (folders)
 *
 * @param {Array<EncounterData>} dataList
 * @param {Object} [options]
 * @returns {Object}
 */
export function createEncounterGroupingMap(dataList, options = {}) {
  const {
    showUngrouped = false,
  } = options;

  const mapping = {};

  dataList.forEach((encounterData) => {
    const {id, groupId} = encounterData;

    // encounters with no `groupId` need not a mapping
    if (groupId === null || groupId === undefined || groupId === '') {
      // unless `showUngrouped` which makes them a group of their own
      if (showUngrouped) {
        mapping[id] = [encounterData];
      }

      return;
    };

    // create a groupList if none exists for the `groupId`, using the encounter's id as the first element
    const groupData = mapping[groupId];
    if (groupData === undefined) {
      mapping[groupId] = [encounterData];
      return;
    }

    // otherwise, add this id to the list
    mapping[groupId].push(encounterData);
  });

  return mapping;
}
/**
 * @param {Object} data
 * @returns {Array<Array<EncounterData.id>>}
 */
export function createEncounterGroupingList(data) {
  return convertObjectToArray(data, {flatten: false});
}
/**
 * @param {Array<EncounterData>} dataList
 * @param {Object} options
 * @returns {Array<EncounterData>}
 */
export function filterEncounterList(dataList, options) {
  const {
    includeTags = [],
    excludeTags = [],
    includeTiles = [],
    excludeTiles = [],
    ...filteredProperties
  } = options;

  return dataList.filter((encounterData) => {
    const {
      dataType,
      isDialogue,
      isImmediate,
      isGeneratable,
      groupId,
      rarityId,
      tagList,
      tileList,
    } = encounterData;

    // check filtering by `dataType`
    if (filteredProperties.dataType !== undefined && dataType !== filteredProperties.dataType) {
      return false;
    }

    // check filtering by `isDialogue`
    if (filteredProperties.isDialogue !== undefined && isDialogue !== filteredProperties.isDialogue) {
      return false;
    }

    // check filtering by `isImmediate`
    if (filteredProperties.isImmediate !== undefined && isImmediate !== filteredProperties.isImmediate) {
      return false;
    }

    // check filtering by `isGeneratable`
    if (filteredProperties.isGeneratable !== undefined && isGeneratable !== filteredProperties.isGeneratable) {
      return false;
    }

    // check filtering by `groupId`
    if (filteredProperties.groupId !== undefined && groupId !== filteredProperties.groupId) {
      return false;
    }

    // check filtering by `rarityId`
    if (filteredProperties.rarityId !== undefined && rarityId !== filteredProperties.rarityId) {
      return false;
    }

    // check for includes tag filters
    if (includeTags.length > 0) {
      // not going to match with no tags at all
      if (tagList === undefined || tagList.length <= 0) {
        return false;
      }

      // includes all of these tags
      const doesIncludeTags = arrayContainsArray(tagList, includeTags);
      if (!doesIncludeTags) {
        return false;
      }
    }

    // check for excludes tag filters
    if (excludeTags.length > 0 && tagList !== undefined) {
      // free pass if tagList is empty
      if (tagList === undefined || tagList.length <= 0) {
        return true;
      }

      // excludes all of these tags
      const doesExcludeTags = !arrayContainsArray(tagList, excludeTags);
      if (!doesExcludeTags) {
        return false;
      }
    }

    // check for includes Tile filters
    if (includeTiles.length > 0) {
      // not going to match with no Tiles at all
      if (tileList === undefined || tileList.length <= 0) {
        return false;
      }

      // includes all of these Tiles
      const doesIncludeTiles = arrayContainsArray(tileList, includeTiles);
      if (!doesIncludeTiles) {
        return false;
      }
    }

    // check for excludes Tile filters
    if (excludeTiles.length > 0 && tileList !== undefined) {
      // free pass if tileList is empty
      if (tileList === undefined || tileList.length <= 0) {
        return true;
      }

      // excludes all of these Tiles
      const doesExcludeTiles = !arrayContainsArray(tileList, excludeTiles);
      if (!doesExcludeTiles) {
        return false;
      }
    }

    // passes filter if data made it this far
    return true;
  });
}
