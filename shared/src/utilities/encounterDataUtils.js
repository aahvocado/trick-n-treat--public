/**
 * I'm worried that the JSON structure of an `encounterData` is going to get unwieldy,
 *  but for now these utility methods should help get values from them
 */

/**
 * @todo - json validation
 *
 * @typedef {Object} EncounterData
 * @property {String} EncounterData.id
 * @property {String} EncounterData.title
 * @property {String} EncounterData.content
 * @property {Array<TagId>} EncounterData.tagList
 * @property {Array<EncounterActionData>} EncounterData.actionList
 * @property {Array<EncounterTriggerData>} EncounterData.tagList
 *
 * @typedef {Object} EncounterActionData
 * @property {ActionId} EncounterActionData.actionId
 * @property {String} EncounterActionData.label
 *
 * @typedef {Object} EncounterTriggerData
 * @property {TriggerId} EncounterTriggerData.triggerId
 * @property {Number | Point} EncounterTriggerData.value
 * @property {Array<ConditionData>} EncounterTriggerData.conditionList
 *
 * @typedef {Object} ConditionData
 * @property {ConditionId} ConditionData.conditionId
 * @property {ConditionTargetId} ConditionData.conditionTargetId
 * @property {Number | Point} ConditionData.value
 */

// -- formatters
/**
 * removes the `ENCOUNTER_ID` prefix
 *
 * @param {String} encounterIdString
 * @returns {String}
 */
export function snipEncounterId(encounterIdString) {
  // if it doesn't have the prefix we don't have to remove it
  const split = encounterIdString.split('.');
  if (split[0] !== 'ENCOUNTER_ID') {
    return encounterIdString;
  }

  split.splice(0, 1);
  return split.join();
}
/**
 * formats the given id string
 * - no white space
 * - all uppercase
 *
 * @param {String} encounterIdString
 * @returns {String}
 */
export function formatEncounterId(encounterIdString) {
  // remove white space and set to uppercase
  const formattedString = encounterIdString.replace(/ /g,'').toUpperCase();

  // return formatted string if it already has the prefix
  const split = formattedString.split('.');
  if (split[0] === 'ENCOUNTER_ID') {
    return formattedString;
  }

  // need to add the prefix
  return 'ENCOUNTER_ID.' + formattedString;
}
// -- getters
/**
 * @param {EncounterData} encounterData
 * @returns {String}
 */
export function getId(encounterData) {
  return encounterData.id;
}
// -- Actions
/**
 * @param {EncounterData} encounterData
 * @returns {Array<EncounterActionData>}
 */
export function getActionList(encounterData) {
  return encounterData.actionList || [];
}
/**
 * @param {EncounterData} encounterData
 * @param {Number} idx
 * @returns {EncounterActionData}
 */
export function getActionAt(encounterData, idx) {
  const actionList = getActionList(encounterData);
  const actionData = actionList[idx];
  return actionData;
}
// -- Action Condition
/**
 * @param {EncounterActionData} encounterActionData
 * @returns {Array<ConditionData>}
 */
export function getActionConditionList(encounterActionData) {
  return encounterActionData.conditionList || [];
}
/**
 * @param {EncounterActionData} encounterActionData
 * @param {Number} idx
 * @returns {Array<ConditionData>}
 */
export function getActionConditionAt(encounterActionData, idx) {
  const conditionList = getActionConditionList(encounterActionData);
  const conditionData = conditionList[idx];
  return conditionData;
}
/**
 * @param {ConditionData} conditionData
 * @returns {ConditionId}
 */
export function getActionConditionId(conditionData) {
  return conditionData.conditionId;
}
/**
 * @param {ConditionData} conditionData
 * @returns {ConditionTargetId}
 */
export function getActionConditionTargetId(conditionData) {
  return conditionData.conditionTargetId;
}
/**
 * @param {ConditionData} conditionData
 * @returns {*}
 */
export function getActionConditionValue(conditionData) {
  return conditionData.value;
}
/**
 * @param {EncounterActionData} encounterActionData
 * @returns {Boolean}
 */
export function hasActionCondition(encounterActionData) {
  const conditionList = getActionConditionList(encounterActionData);
  return conditionList > 0;
}
// -- Triggers
/**
 * @param {EncounterData} encounterData
 * @returns {Array<EncounterTriggerData>}
 */
export function getTriggerList(encounterData) {
  return encounterData.triggerList || [];
}
/**
 * @param {EncounterData} encounterData
 * @param {Number} idx
 * @returns {EncounterTriggerData}
 */
export function getTriggerAt(encounterData, idx) {
  const triggerList = getTriggerList(encounterData);
  const triggerData = triggerList[idx];
  return triggerData;
}
/**
 * @param {EncounterTriggerData} encounterTriggerData
 * @returns {TriggerId}
 */
export function getTriggerId(encounterTriggerData) {
  return encounterTriggerData.triggerId;
}
// -- Trigger Condition
/**
 * @param {EncounterTriggerData} encounterTriggerData
 * @returns {Array<ConditionData>}
 */
export function getTriggerConditionList(encounterTriggerData) {
  return encounterTriggerData.conditionList || [];
}
/**
 * @param {EncounterTriggerData} encounterTriggerData
 * @param {Number} idx
 * @returns {Array<ConditionData>}
 */
export function getTriggerConditionAt(encounterTriggerData, idx) {
  const conditionList = getTriggerConditionList(encounterTriggerData);
  const conditionData = conditionList[idx];
  return conditionData;
}
/**
 * @param {ConditionData} conditionData
 * @returns {ConditionId}
 */
export function getTriggerConditionId(conditionData) {
  return conditionData.conditionId;
}
/**
 * @param {ConditionData} conditionData
 * @returns {ConditionTargetId}
 */
export function getTriggerConditionTargetId(conditionData) {
  return conditionData.conditionTargetId;
}
/**
 * @param {ConditionData} conditionData
 * @returns {*}
 */
export function getTriggerConditionValue(conditionData) {
  return conditionData.value;
}
/**
 * @param {EncounterTriggerData} encounterTriggerData
 * @returns {Boolean}
 */
export function hasTriggerCondition(encounterTriggerData) {
  const conditionList = getTriggerConditionList(encounterTriggerData);
  return conditionList > 0;
}
