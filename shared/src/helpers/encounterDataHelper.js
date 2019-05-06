import encounterJsonList from 'data.shared/encounterData.json';

import convertArrayToMap from 'utilities.shared/convertArrayToMap';

/**
 * @typedef {Array}
 */
export const ENCOUNTER_DATA = encounterJsonList;
/**
 * caches an object map of the `encounterData` so it can be accessed more easily
 */
export const ENCOUNTER_DATA_MAP = convertArrayToMap(ENCOUNTER_DATA);
/**
 * finds the data for a loaded encounter by its id
 *
 * @param {String} id
 * @returns {Object}
 */
export function getEncounterAttributes(id) {
  return ENCOUNTER_DATA_MAP[id];
}
