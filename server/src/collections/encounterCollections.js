import {
  ENCOUNTER_ACTION_ID,
  ENCOUNTER_TRIGGER_ID,
} from 'constants.shared/encounterConstants';

import encounterJsonList from 'data/encounterData.json';

import logger from 'utilities/logger.game';

/**
 * parses the entire json list
 * @todo - see if this is necessary in the future because it seems like node already parses json into objects
 *
 * @param {Array<JSON>} encounterJsonList
 * @returns {Object}
 */
function parseEncounterJsonList(encounterJsonList) {
  return encounterJsonList;
}
/** @type {Array<Object>} */
const parsedEncounterList = parseEncounterJsonList(encounterJsonList);
/** @type {Object} */
const parsedEncounterMapping = (() => {
  const mapping = {};

  parsedEncounterList.forEach((encounterData) => {
    const {id} = encounterData;
    if (mapping[id] !== undefined) {
      logger.error(`Duplicate Encounter with ${id} found while mapping!`);
      return;
    }

    mapping[id] = encounterData;
  });

  return mapping;
})();
/**
 * finds the data for a loaded encounter by its id
 *
 * @param {String} id
 * @returns {Object}
 */
export function getEncounterAttributes(id) {
  const foundEncounterData = parsedEncounterMapping[id];
  return foundEncounterData;
}
