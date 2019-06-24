import Joi from '@hapi/joi';

import {CHOICE_ID, GOTO_CHOICE_ID_LIST} from 'constants.shared/choiceIds';
import {DATA_TYPE} from 'constants.shared/dataTypes';
import {TARGET_ID} from 'constants.shared/targetIds';

import * as conditionLogicUtils from 'utilities.shared/conditionLogicUtils';
import * as triggerLogicUtils from 'utilities.shared/triggerLogicUtils';

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
  const createdTemplate = {
    dataType: DATA_TYPE.CONDITION,
    targetId: undefined,
    itemId: undefined,
    conditionLogicId: undefined,
    value: 1,
    ...defaultData,
  };

  return createdTemplate;
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
  const formattedData = {
    dataType: data.dataType,
    targetId: data.targetId,
    itemId: data.itemId || '',
    conditionLogicId: data.conditionLogicId,
    value: Number(data.value),
  };

  const isItemConditionLogic = conditionLogicUtils.isItemConditionLogic(formattedData.conditionLogicId);
  if (isItemConditionLogic) {
    formattedData.targetId = TARGET_ID.ITEM.ALL;
  } else {
    delete formattedData.itemId;
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
  const createdTemplate = {
    dataType: DATA_TYPE.ACTION,
    choiceId: CHOICE_ID.CONFIRM,
    gotoId: undefined,
    label: 'Okay',
    // conditionList: [],
    ...defaultData,
  };

  const isGoto = GOTO_CHOICE_ID_LIST.includes(createdTemplate.choiceId);
  if (!isGoto) {
    createdTemplate.gotoId = undefined;
  }

  if (isGoto && createdTemplate.choiceId === CHOICE_ID.TRICK) {
    createdTemplate.label = 'Trick';
  }

  if (isGoto && createdTemplate.choiceId === CHOICE_ID.TREAT) {
    createdTemplate.label = 'Treat';
  }

  return createdTemplate;
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
  const formattedData = {
    dataType: data.dataType,
    choiceId: data.choiceId,
    gotoId: data.gotoId,
    label: data.label,
    conditionList: formatConditionList(data.conditionList),
  };

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
  value: Joi.number().required(),
  itemId: Joi.string().optional(),
  conditionList: Joi.array().optional(),
});
/**
 * @param {*} data
 * @returns {Boolean}
 */
export function validateTrigger(data) {
  const validation = Joi.validate(data, triggerSchema);

  // valid if null
  if (validation.error === null) {
    return true;
  }

  console.warn(validation.error);
  return false;
}
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
  };

  return {...blankTemplate, ...defaultData};
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
  const formattedData = {
    dataType: data.dataType,
    targetId: data.targetId,
    triggerLogicId: data.triggerLogicId,
    itemId: data.itemId || '',
    value: Number(data.value),
    conditionList: formatConditionList(data.conditionList),
  };

  const isItemTriggerLogic = triggerLogicUtils.isItemTriggerLogic(formattedData.triggerLogicId);
  if (isItemTriggerLogic) {
    formattedData.targetId = TARGET_ID.ITEM.ALL;
  } else {
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
