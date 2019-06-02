import {DATA_TYPE} from 'constants.shared/dataTypes';
import {CHOICE_ID} from 'constants.shared/choiceIds'

/**
 * @todo - json validation
 *
 * @typedef {Object} EncounterData
 * @property {String} EncounterData.id
 * @property {String} EncounterData.title
 * @property {String} EncounterData.content
 * @property {Array<TagData>} EncounterData.tagList
 * @property {Array<ActionData>} EncounterData.actionList
 * @property {Array<TriggerData>} EncounterData.tagList
 */

const idPrefix = 'ENCOUNTER_ID';

/**
 * @returns {ItemData}
 */
export function getBlankTemplate() {
  return {
    dataType: DATA_TYPE.ENCOUNTER,
    id: `${idPrefix}.NEW`,
    title: '',
    content: '',
    tagList: [],
    conditionList: [],
    actionList: [{
      dataType: DATA_TYPE.ACTION,
      label: 'Okay',
      choiceId: CHOICE_ID.CONFIRM,
    }],
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
