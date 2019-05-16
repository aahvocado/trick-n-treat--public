/**
 * This contains general purpose utility methods for
 * - itemData.json
 * - encounterData.json
 *
 * since it is still currently abstract in how they work
 */

/**
 * @typedef {Object} ActionData
 * @property {ActionId} ActionData.actionId
 * @property {String} ActionData.label
 *
 * @typedef {Object} TriggerData
 * @property {TriggerId} TriggerData.triggerId
 * @property {Number | Point} TriggerData.value
 * @property {Array<ConditionData>} TriggerData.conditionList
 *
 * @typedef {Object} ConditionData
 * @property {ConditionId} ConditionData.conditionId
 * @property {ConditionTargetId} ConditionData.conditionTargetId
 * @property {Number | Point} ConditionData.value
 */

/**
 * @param {EncounterData | ItemData} dataObject
 * @returns {String}
 */
export function getId(dataObject) {
  return dataObject.id;
}
// -- Tags
/**
 * @param {EncounterData | ItemData} dataObject
 * @returns {Array<TagData>}
 */
export function getTagList(dataObject) {
  return dataObject.tagList || [];
}
/**
 * @param {EncounterData | ItemData} dataObject
 * @param {Number} idx
 * @returns {TagData | undefined}
 */
export function getTagAt(dataObject, idx) {
  const tagList = getTagList(dataObject);
  const tagData = tagList[idx];
  return tagData;
}
// -- Actions
/**
 * @param {EncounterData | ItemData} dataObject
 * @returns {Array<ActionData>}
 */
export function getActionList(dataObject) {
  return dataObject.actionList || [];
}
/**
 * @param {EncounterData | ItemData} dataObject
 * @param {Number} idx
 * @returns {ActionData | undefined}
 */
export function getActionAt(dataObject, idx) {
  const actionList = getActionList(dataObject);
  const actionData = actionList[idx];
  return actionData;
}
// -- Triggers
/**
 * @param {EncounterData | ItemData} dataObject
 * @returns {Array<TriggerData>}
 */
export function getTriggerList(dataObject) {
  return dataObject.triggerList || [];
}
/**
 * @param {EncounterData | ItemData} dataObject
 * @param {Number} idx
 * @returns {TriggerData | undefined}
 */
export function getTriggerAt(dataObject, idx) {
  const triggerList = getTriggerList(dataObject);
  const triggerData = triggerList[idx];
  return triggerData;
}
// -- Conditions
/**
 * @param {EncounterData | ItemData | ActionData | TriggerData} dataObject
 * @returns {Array<ConditionData>}
 */
export function getConditionList(dataObject) {
  return dataObject.conditionList || [];
}
/**
 * @param {EncounterData | ItemData | ActionData | TriggerData} dataObject
 * @param {Number} idx
 * @returns {ConditionData | undefined}
 */
export function getConditionAt(dataObject, idx) {
  const conditionList = getConditionList(dataObject);
  const conditionData = conditionList[idx];
  return conditionData;
}
/**
 * @param {EncounterData | ItemData | ActionData | TriggerData} dataObject
 * @returns {Boolean}
 */
export function hasConditions(dataObject) {
  const conditionList = getConditionList(dataObject);
  return conditionList > 0;
}
