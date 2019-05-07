import encounterJsonList from 'data.shared/encounterData.json';

import arrayContainsArray from 'utilities.shared/arrayContainsArray';
import convertArrayToMap from 'utilities.shared/convertArrayToMap';

/**
 * @type {Array}
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
export function getEncounterDataById(id) {
  return ENCOUNTER_DATA_MAP[id];
}
/**
 * finds all Encounters with given Tag
 *
 * @param {TagId} tagId
 * @returns {Array<EncounterData>}
 */
export function getEncounterDataWithTag(tagId) {
  return ENCOUNTER_DATA.filter((encounter) =>
    encounter.tagList.includes(tagId)
  )
}
/**
 * finds all Encounters using options
 *
 * @param {Object} options
 * @property {Array} options.includeTags - one with all of these tags
 * @property {Array} options.excludeTags - one without any of these tags
 * @returns {Array<EncounterData>}
 */
export function findEncounterData(options) {
  const {
    includeTags = [],
    excludeTags = [],
  } = options;

  return ENCOUNTER_DATA.filter((encounter) => {
    const doesIncludeTags = arrayContainsArray(encounter.tagList, includeTags);
    const doesExcludeTags = !arrayContainsArray(encounter.tagList, excludeTags);
    return doesIncludeTags && doesExcludeTags;
  });
}
