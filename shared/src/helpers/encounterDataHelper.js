import encounterJsonList from 'data.shared/encounterData.json';

import arrayContainsArray from 'utilities.shared/arrayContainsArray';
import convertArrayToMap from 'utilities.shared/convertArrayToMap';
import convertObjectToArray from 'utilities.shared/convertObjectToArray';

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
/** @type {Object} */
export const ENCOUNTER_GROUPING_MAP = createEncounterGroupingMap(ENCOUNTER_DATA);
/** @type {Array<Array<EncounterData.id>>} */
export const ENCOUNTER_GROUPING_LIST = createEncounterGroupingList(ENCOUNTER_GROUPING_MAP);
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
