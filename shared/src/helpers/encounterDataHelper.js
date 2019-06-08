import encounterJsonList from 'data.shared/encounterData.json';

import {DATA_TYPE} from 'constants.shared/dataTypes';

import arrayContainsArray from 'utilities.shared/arrayContainsArray';
import convertArrayToMap from 'utilities.shared/convertArrayToMap';
import * as encounterDataUtils from 'utilities.shared/encounterDataUtils';

// -- cache for `encounterData.json`
/** @type {Array} */
export const ALL_ENCOUNTER_DATA_LIST = encounterJsonList;
ALL_ENCOUNTER_DATA_LIST.forEach(encounterDataUtils.validateEncounter);
/**
 * caches an object map of the `encounterData` so it can be accessed more easily
 */
export const ALL_ENCOUNTER_DATA_LIST_MAP = convertArrayToMap(ALL_ENCOUNTER_DATA_LIST);
// -- groupings
/** @type {Object} */
export const ENCOUNTER_GROUPING_MAP = encounterDataUtils.createEncounterGroupingMap(ALL_ENCOUNTER_DATA_LIST);
/** @type {Array<Array<EncounterData>>} */
export const ENCOUNTER_GROUPING_LIST = encounterDataUtils.createEncounterGroupingList(ENCOUNTER_GROUPING_MAP);
/** @type {Array<Array<EncounterData>>} */
export const GROUPINGS_ID_LIST = Object.keys(ENCOUNTER_GROUPING_MAP);
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
