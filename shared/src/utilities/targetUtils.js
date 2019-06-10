import {
  TARGET_ID,
  CHARACTER_TARGET_ID_LIST,
  ENCOUNTER_TARGET_ID_LIST,
  NUMBER_TARGET_ID_LIST,
} from 'constants.shared/targetIds';

import * as statUtils from 'utilities.shared/statUtils';

/**
 * get the value from Character's attributes using given `targetId`
 *
 * @param {TargetId} targetId
 * @param {CharacterModel} characterModel
 * @param {EncounterModel} encounterModel
 * @returns {*}
 */
export function handleGetTargetParameter(targetId, characterModel, encounterModel) {
  if (targetId === TARGET_ID.ITEM.ALL) {
    return characterModel.get('inventoryList');
  }

  if (isCharacterTarget(targetId)) {
    return getTargetParameterFromCharacter(targetId, characterModel);
  }

  if (isEncounterTarget(targetId)) {
    return getTargetParameterFromEncounter(targetId, characterModel, encounterModel);
  }
}
/**
 * get the value from Character's attributes using given `targetId`
 *
 * @param {TargetId} targetId
 * @param {CharacterModel} characterModel
 * @returns {Number}
 */
export function getTargetParameterFromCharacter(targetId, characterModel) {
  const statId = statUtils.convertTargetToStat(targetId);
  return characterModel.getStatById(statId);
}
/**
 * get the value from Character's attributes using given `targetId`
 *
 * @param {TargetId} targetId
 * @param {CharacterModel} characterModel
 * @param {EncounterModel} encounterModel
 * @returns {Number}
 */
export function getTargetParameterFromEncounter(targetId, characterModel, encounterModel) {
  if (targetId === TARGET_ID.ENCOUNTER.CHARACTER_TRIGGER_COUNT) {
    return encounterModel.getVisitsBy(characterModel);
  }
  if (targetId === TARGET_ID.ENCOUNTER.CHARACTER_TRICK_COUNT) {
    return encounterModel.getTricksBy(characterModel);
  }
  if (targetId === TARGET_ID.ENCOUNTER.CHARACTER_TREAT_COUNT) {
    return encounterModel.getTreatsBy(characterModel);
  }

  if (targetId === TARGET_ID.ENCOUNTER.TOTAL_VISITORS) {
    const visitors = encounterModel.get('visitors');
    return visitors.length;
  }
  if (targetId === TARGET_ID.ENCOUNTER.TOTAL_TRICKS) {
    const trickers = encounterModel.get('trickers');
    return trickers.length;
  }
  if (targetId === TARGET_ID.ENCOUNTER.TOTAL_TREATS) {
    const treaters = encounterModel.get('treaters');
    return treaters.length;
  }

  if (targetId === TARGET_ID.ENCOUNTER.UNIQUE_VISITORS) {
    return encounterModel.getUniqueVisitors().size;
  }
  if (targetId === TARGET_ID.ENCOUNTER.UNIQUE_TRICKS) {
    return encounterModel.getUniqueTrickers().size;
  }
  if (targetId === TARGET_ID.ENCOUNTER.UNIQUE_TREATS) {
    return encounterModel.getUniqueTreaters().size;
  }

  // probably means that the `targetId` isn't based on an Encounter
  return undefined;
}
// -- basic utilities
/**
 * does target depend on a Character
 *
 * @param {TargetId} targetId
 * @returns {Boolean}
 */
export function isCharacterTarget(targetId) {
  return CHARACTER_TARGET_ID_LIST.includes(targetId);
}
/**
 * does target depend on a Encounter
 *
 * @param {TargetId} targetId
 * @returns {Boolean}
 */
export function isEncounterTarget(targetId) {
  return ENCOUNTER_TARGET_ID_LIST.includes(targetId);
}
/**
 * does target depend on a Number
 *
 * @param {TargetId} targetId
 * @returns {Boolean}
 */
export function isNumberTarget(targetId) {
  return NUMBER_TARGET_ID_LIST.includes(targetId);
}
