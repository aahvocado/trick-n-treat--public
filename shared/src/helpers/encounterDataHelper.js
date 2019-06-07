import encounterJsonList from 'data.shared/encounterData.json';

import {DATA_TYPE} from 'constants.shared/dataTypes';

import arrayContainsArray from 'utilities.shared/arrayContainsArray';
import convertArrayToMap from 'utilities.shared/convertArrayToMap';
import * as encounterDataUtils from 'utilities.shared/encounterDataUtils';

/** @type {Array} */
export const ALL_ENCOUNTER_DATA_LIST = encounterJsonList;
ALL_ENCOUNTER_DATA_LIST.forEach(encounterDataUtils.validateEncounter);
/**
 * caches an object map of the `encounterData` so it can be accessed more easily
 */
export const ALL_ENCOUNTER_DATA_LIST_MAP = convertArrayToMap(ALL_ENCOUNTER_DATA_LIST);
/**
 * this is a list of the data that is generatable
 *
 * @type {Array}
 */
export const GENERATABLE_ALL_ENCOUNTER_DATA_LIST = ALL_ENCOUNTER_DATA_LIST.filter((data) => (data.isGeneratable));
/** @type {Array} */
export const ENCOUNTER_DATA_TYPE_LIST = ALL_ENCOUNTER_DATA_LIST.filter((data) => (data.dataType === DATA_TYPE.ENCOUNTER));
/** @type {Array} */
export const HOUSE_DATA_TYPE_LIST = ALL_ENCOUNTER_DATA_LIST.filter((data) => (data.dataType === DATA_TYPE.HOUSE));
/**
 * finds the data for a loaded encounter by its id
 *
 * @param {String} id
 * @returns {Object}
 */
export function getEncounterDataById(id) {
  return ALL_ENCOUNTER_DATA_LIST_MAP[id];
}
/**
 * finds all Encounters using options
 *
 * @param {Object} [options]
 * @returns {Array<EncounterData>}
 */
export function findEncounterData(options = {}) {
  return encounterDataUtils.filterEncounterList(ALL_ENCOUNTER_DATA_LIST, options);
}
/** @type {Object} */
export const ENCOUNTER_GROUPING_MAP = encounterDataUtils.createEncounterGroupingMap(ALL_ENCOUNTER_DATA_LIST);
/** @type {Array<Array<EncounterData>>} */
export const ENCOUNTER_GROUPING_LIST = encounterDataUtils.createEncounterGroupingList(ENCOUNTER_GROUPING_MAP);
/** @type {Array<Array<EncounterData>>} */
export const GROUPINGS_ID_LIST = Object.keys(ENCOUNTER_GROUPING_MAP);
