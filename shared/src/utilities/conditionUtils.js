import * as conditionLogicUtils from 'utilities.shared/conditionLogicUtils';
import * as targetUtils from 'utilities.shared/targetUtils';

/**
 * checks if all Conditions in a list pass based on given parameters
 *
 * @param {Array<ConditionData>} conditionList
 * @param {CharacterModel} characterModel
 * @param {EncounterModel} [encounterModel]
 * @returns {Boolean}
 */
export function doesMeetAllConditions(conditionList, characterModel, encounterModel) {
  // empty list means there are no conditions, so its a free pass
  if (conditionList === undefined || conditionList.length <= 0) {
    return true;
  }

  // check that each condition passes
  return conditionList.every((conditionData) => {
    return doesMeetCondition(conditionData, characterModel, encounterModel);
  });
}
/**
 * checks if a single condition passes
 *
 * @param {ConditionData} conditionData
 * @param {CharacterModel} characterModel
 * @param {EncounterModel} encounterModel
 * @returns {Boolean}
 */
export function doesMeetCondition(conditionData, characterModel, encounterModel) {
  const {
    targetId,
  } = conditionData;

  // get the function that will do the work of checking if condition is met
  const logicFunction = conditionLogicUtils.handleGetLogicFunction(conditionData);

  // get the parameter that we will pass into the `logicFunction`
  const targetParameter = targetUtils.handleGetTargetParameter(targetId, characterModel, encounterModel);

  // FUSION HAAAAA
  return logicFunction(targetParameter);
}

