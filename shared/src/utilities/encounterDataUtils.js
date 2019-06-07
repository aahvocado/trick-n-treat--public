import Joi from '@hapi/joi';

import {CHOICE_ID, GOTO_CHOICE_ID_LIST} from 'constants.shared/choiceIds';
import {DATA_TYPE} from 'constants.shared/dataTypes';

import arrayContainsArray from 'utilities.shared/arrayContainsArray';
import convertObjectToArray from 'utilities.shared/convertObjectToArray';

/**
 * here you will find the utility functions that help construct an EncounterData object
 *
 * @typedef {Object} EncounterData
 */

/** @type {String} */
const idPrefix = 'ENCOUNTER_ID';
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

  let mapping = {};

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
    ...filteredProperties
  } = options;

  return dataList.filter((encounterData) => {
    const {
      dataType,
      isDialogue,
      isGeneratable,
      groupId,
      rarityId,
      tagList,
    } = encounterData;

    // check filtering by `dataType`
    if (filteredProperties.dataType !== undefined && dataType !== filteredProperties.dataType) {
      return false;
    }

    // check filtering by `isDialogue`
    if (filteredProperties.isDialogue !== undefined && isDialogue !== filteredProperties.isDialogue) {
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

    // includes all of these tags
    if (includeTags.length > 0 && tagList !== undefined) {
      const doesIncludeTags = arrayContainsArray(tagList, includeTags);
      if (!doesIncludeTags) {
        return false;
      }
    }

    // excludes all of these tags
    if (excludeTags.length > 0 && tagList !== undefined) {
      const doesExcludeTags = !arrayContainsArray(tagList, excludeTags);
      if (!doesExcludeTags) {
        return false;
      }
    }

    // passes filter if data made it this far
    return true;
  });
}
// -- encounter
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
  isGeneratable: Joi.boolean().required(),
  rarityId: Joi.string().optional(),
  isDialogue: Joi.boolean().required(),
  actionList: Joi.array().min(1).required(),
  tagList: Joi.array(),
  triggerList: Joi.array(),
  conditionList: Joi.array().optional(),
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
    isGeneratable: true,
    // rarityId: undefined,
    isDialogue: false,
    actionList: [createActionData()],
    // tagList: [],
    // triggerList: [],
    // conditionList: [],
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
  let formattedData = {
    dataType: data.dataType,
    id: data.id,
    title: data.title,
    content: data.content,
    isGeneratable: data.isGeneratable,
    rarityId: data.rarityId,
    isDialogue: data.isDialogue,
    tagList: data.tagList || [],
    actionList: formatActionList(data.actionList),
    triggerList: formatTriggerList(data.triggerList),
    conditionList: formatConditionList(data.conditionList),
    groupId: data.groupId || '',
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

  // remove blank optional strings
  if (formattedData.groupId.length <= 0) {
    delete formattedData.groupId;
  }

  // if this is not Generatable
  if (!formattedData.isGeneratable) {
    // it does not need a `conditionList`
    if (formattedData.conditionList) {
      delete formattedData.conditionList;
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
// -- condition
/**
 * schema for ConditionData
 *
 * @type {Joi.Schema}
 */
const conditionSchema = Joi.object().keys({
  dataType: Joi.string().required(),
  targetId: Joi.string().required(),
  conditionLogicId: Joi.string().required(),
  value: Joi.number().required(),
});
/**
 * @param {*} data
 * @returns {Boolean}
 */
export function validateCondition(data) {
  const validation = Joi.validate(data, conditionSchema);

  // valid if null
  if (validation.error === null) {
    return true;
  }

  console.warn(validation.error);
  return false;
}
/**
 * @param {Object} [defaultData]
 * @returns {ConditionData}
 */
export function createConditionData(defaultData = {}) {
  const blankTemplate = {
    dataType: DATA_TYPE.CONDITION,
    targetId: undefined,
    conditionLogicId: undefined,
    value: 1
  };

  return updateConditionData(blankTemplate, defaultData);
}
/**
 * @param {ConditionData} data
 * @param {Object} changes
 * @returns {ConditionData}
 */
export function updateConditionData(data, changes) {
  const resultData = {
    ...data,
    ...changes,
  };

  return resultData;
}
/**
 * @param {Array<ConditionData>} list
 * @param {Object} newData
 * @param {Number} idx - index of the condition
 * @returns {ConditionData}
 */
export function updateConditionDataAt(list, newData, idx) {
  const conditionList = list.slice();
  const originalData = conditionList[idx];

  // created updated data
  const updatedData = updateConditionData(originalData, newData);

  // update the item in the list
  conditionList[idx] = updatedData;

  // return updated list
  return conditionList;
}
/**
 * @param {Object} data
 * @param {ConditionData} newData
 * @returns {Object}
 */
export function addConditionToData(data, newData) {
  // add newData to the list
  const conditionList = data.conditionList || [];
  conditionList.push(newData);

  // create data
  const resultData = {
    ...data,
    conditionList: conditionList,
  };

  return resultData;
}
/**
 * formats ConditionData
 * - orders the properties (in an arbitrary way that I like)
 *
 * @param {ConditionData} data
 * @returns {ConditionData}
 */
export function formatConditionData(data) {
  // put the data in order
  let formattedData = {
    dataType: data.dataType,
    targetId: data.targetId,
    conditionLogicId: data.conditionLogicId,
    value: data.value,
  }

  // all done
  return formattedData;
}
/**
 * @param {Array<ConditionData>} conditionList
 * @returns {Array<ConditionData>}
 */
export function formatConditionList(conditionList = []) {
  return conditionList.map(formatConditionData);
}
// -- action
/**
 * schema for ActionData
 *
 * @type {Joi.Schema}
 */
const actionSchema = Joi.object().keys({
  dataType: Joi.string().required(),
  choiceId: Joi.string().required(),
  gotoId: Joi.string().required(),
  label: Joi.string().required(),
  conditionList: Joi.array().optional(),
});
/**
 * @param {*} data
 * @returns {Boolean}
 */
export function validateAction(data) {
  const validation = Joi.validate(data, actionSchema);

  // valid if null
  if (validation.error === null) {
    return true;
  }

  console.warn(validation.error);
  return false;
}
/**
 * @param {Object} [defaultData]
 * @returns {ActionData}
 */
export function createActionData(defaultData = {}) {
  const blankTemplate = {
    dataType: DATA_TYPE.ACTION,
    choiceId: CHOICE_ID.CONFIRM,
    gotoId: undefined,
    label: 'Okay',
    // conditionList: [],
  }

  return {...blankTemplate, ...defaultData}
}
/**
 * @param {ActionData} data
 * @param {Object} changes
 * @returns {ActionData}
 */
export function updateActionData(data, changes) {
  const resultData = {
    ...data,
    ...changes,
  };

  const isGoto = GOTO_CHOICE_ID_LIST.includes(resultData.choiceId);
  if (!isGoto) {
    resultData.gotoId = undefined;
  }

  if (isGoto && resultData.choiceId === CHOICE_ID.TRICK) {
    resultData.label = 'Trick';
  }

  if (isGoto && resultData.choiceId === CHOICE_ID.TREAT) {
    resultData.label = 'Treat';
  }

  return resultData;
}
/**
 * @param {Array<ActionData>} list
 * @param {Object} newData
 * @param {Number} idx - index of the condition
 * @returns {ActionData}
 */
export function updateActionDataAt(list, newData, idx) {
  const actionList = list.slice();
  const originalData = actionList[idx];

  // created updated data
  const updatedData = updateActionData(originalData, newData);

  // update the item in the list
  actionList[idx] = updatedData;

  // return updated list
  return actionList;
}
/**
 * @param {Object} data
 * @param {ActionData} newData
 * @returns {Object}
 */
export function addActionToData(data, newData) {
  // add newData to the list
  const actionList = data.actionList || [];
  actionList.push(newData);

  // create data
  const resultData = {
    ...data,
    actionList: actionList,
  };

  return resultData;
}
/**
 * formats ActionData
 * - orders the properties (in an arbitrary way that I like)
 *
 * @param {ActionData} data
 * @returns {ActionData}
 */
export function formatActionData(data) {
  // put the data in order
  let formattedData = {
    dataType: data.dataType,
    choiceId: data.choiceId,
    gotoId: data.gotoId,
    label: data.label,
    conditionList: formatConditionList(data.conditionList),
  }

  // remove empty arrays
  if (formattedData.conditionList.length <= 0) {
    delete formattedData.conditionList;
  }

  // no need for a `gotoId` if `choiceId` does not support it
  if (!GOTO_CHOICE_ID_LIST.includes(formattedData.choiceId)) {
    delete formattedData.gotoId;
  }

  // all done
  return formattedData;
}
/**
 * @param {Array<ActionData>} actionList
 * @returns {Array<ActionData>}
 */
export function formatActionList(actionList = []) {
  return actionList.map(formatActionData);
}
// -- trigger
/**
 * schema for TriggerData
 *
 * @type {Joi.Schema}
 */
const triggerSchema = Joi.object().keys({
  dataType: Joi.string().required(),
  targetId: Joi.string().required(),
  triggerLogicId: Joi.string().required(),
  value: Joi.number(),
  itemId: Joi.string().optional(),
  conditionList: Joi.array().optional(),
});
/**
 * @param {Object} [defaultData]
 * @returns {TriggerData}
 */
export function createTriggerData(defaultData = {}) {
  const blankTemplate = {
    dataType: DATA_TYPE.TRIGGER,
    triggerLogicId: undefined,
    targetId: undefined,
    value: 1,
    // itemId: undefined,
    // conditionList: [],
  }

  return {...blankTemplate, ...defaultData}
}
/**
 * @param {Array<TriggerData>} list
 * @param {Object} newData
 * @param {Number} idx - index of the condition
 * @returns {TriggerData}
 */
export function updateTriggerDataAt(list, newData, idx) {
  const triggerList = list.slice();
  const originalData = triggerList[idx];

  // created updated data
  const updatedData = {
    ...originalData,
    ...newData,
  };

  // update the item in the list
  triggerList[idx] = updatedData;

  // return updated list
  return triggerList;
}
/**
 * @param {Object} data
 * @param {TriggerData} newData
 * @returns {Object}
 */
export function addTriggerToData(data, newData) {
  // add newData to the list
  const triggerList = data.triggerList || [];
  triggerList.push(newData);

  // create data
  const resultData = {
    ...data,
    triggerList: triggerList,
  };

  return resultData;
}
/**
 * formats TriggerData
 * - orders the properties (in an arbitrary way that I like)
 *
 * @param {TriggerData} data
 * @returns {TriggerData}
 */
export function formatTriggerData(data) {
  // put the data in order
  let formattedData = {
    dataType: data.dataType,
    targetId: data.targetId,
    triggerLogicId: data.triggerLogicId,
    value: data.value,
    itemId: data.itemId || '',
    conditionList: formatConditionList(data.conditionList),
  }

  if (formattedData.itemId.length <= 0) {
    delete formattedData.itemId;
  }

  if (formattedData.conditionList.length <= 0) {
    delete formattedData.conditionList;
  }

  // all done
  return formattedData;
}
/**
 * @param {Array<TriggerData>} triggerList
 * @returns {Array<TriggerData>}
 */
export function formatTriggerList(triggerList = []) {
  return triggerList.map(formatTriggerData);
}
