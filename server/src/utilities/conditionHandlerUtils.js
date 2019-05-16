import {
  CONDITION_ID,
  CONDITION_TARGET_ID,
} from 'constants.shared/conditionIds';

/**
 * checks is a given character meets list of Conditions
 *
 * @param {CharacterModel} characterModel
 * @param {Array<ConditionData>} conditionList
 * @returns {Boolean}
 */
export function doesMeetAllConditions(characterModel, conditionList) {
  // empty list means there are no conditions
  if (conditionList.length <= 0) {
    return true;
  }

  // check that each condition passes
  return conditionList.every((conditionData) => {
    return doesMeetCondition(characterModel, conditionData);
  });
}
/**
 * checks is a given character meets given condition
 *
 * @param {CharacterModel} characterModel
 * @param {ConditionData} conditionData
 * @returns {Boolean}
 */
export function doesMeetCondition(characterModel, conditionData) {
  const {
    conditionId,
    conditionTargetId,
  } = conditionData;

  // find what Stat is being targetted
  const targetValue = getCharacterConditionTargetValue(characterModel, conditionTargetId);

  if (conditionId === CONDITION_ID.EQUALS) {
    return doesMeetConditionOfEquals(targetValue, conditionData);
  }

  if (conditionId === CONDITION_ID.LESS_THAN) {
    return doesMeetConditionOfLessThan(targetValue, conditionData);
  }

  if (conditionId === CONDITION_ID.GREATER_THAN) {
    return doesMeetConditionOfGreaterThan(targetValue, conditionData);
  }

  if (conditionId === CONDITION_ID.AT_LOCATION) {
    return doesMeetConditionOfAtLocation(targetValue, conditionData);
  }

  if (conditionId === CONDITION_ID.HAS_ITEM) {
    return doesMeetConditionOfHasItem(characterModel, conditionData);
  }

  // if (conditionId === CONDITION_ID.ON_TILE_TYPE) {
  //   return doesMeetConditionOfOnTileType(targetValue, conditionData);
  // }
}
/**
 * handles determining how to get a particular value from a Character using the `conditionTargetId`
 *
 * @param {CharacterModel} characterModel
 * @param {ConditionTargetId} conditionTargetId
 * @returns {Number | Point}
 */
export function getCharacterConditionTargetValue(characterModel, conditionTargetId) {
  if (conditionTargetId === CONDITION_TARGET_ID.STAT.HEALTH) {
    return characterModel.get('health');
  }

  if (conditionTargetId === CONDITION_TARGET_ID.STAT.MOVEMENT) {
    return characterModel.get('movement');
  }

  if (conditionTargetId === CONDITION_TARGET_ID.STAT.SANITY) {
    return characterModel.get('sanity');
  }

  if (conditionTargetId === CONDITION_TARGET_ID.STAT.VISION) {
    return characterModel.get('vision');
  }

  if (conditionTargetId === CONDITION_TARGET_ID.STAT.CANDIES) {
    return characterModel.get('candies');
  }

  if (conditionTargetId === CONDITION_TARGET_ID.STAT.LUCK) {
    return characterModel.get('luck');
  }

  if (conditionTargetId === CONDITION_TARGET_ID.STAT.GREED) {
    return characterModel.get('greed');
  }

  if (conditionTargetId === CONDITION_TARGET_ID.LOCATION) {
    return characterModel.get('location');
  }
}
/**
 *
 * @param {Number} targetValue
 * @param {ConditionData} conditionData
 * @returns {Boolean}
 */
export function doesMeetConditionOfEquals(targetValue, conditionData) {
  const conditionValue = conditionData.value;
  return targetValue === conditionValue;
};
/**
 *
 * @param {Number} targetValue
 * @param {ConditionData} conditionData
 * @returns {Boolean}
 */
export function doesMeetConditionOfLessThan(targetValue, conditionData) {
  const conditionValue = conditionData.value;
  return targetValue < conditionValue;
};
/**
 *
 * @param {Number} targetValue
 * @param {ConditionData} conditionData
 * @returns {Boolean}
 */
export function doesMeetConditionOfGreaterThan(targetValue, conditionData) {
  const conditionValue = conditionData.value;
  return targetValue > conditionValue;
};
/**
 * @todo - not sure how useful this is, since being at a specific location is near impossible
 *
 * @param {Point} targetValue
 * @param {ConditionData} conditionData
 * @returns {Boolean}
 */
export function doesMeetConditionOfAtLocation(targetValue, conditionData) {
  const conditionValue = conditionData.value;
  return targetValue.x === conditionValue.x && targetValue.y === conditionValue.y;
};
/**
 * @todo - not sure how useful this is, since being at a specific location is near impossible
 *
 * @param {CharacterModel} characterModel
 * @param {ConditionData} conditionData
 * @returns {Boolean}
 */
export function doesMeetConditionOfHasItem(characterModel, conditionData) {
  const inventory = characterModel.get('inventory');
  const itemId = conditionData.itemId;

  const matchingItem = inventory.find((item) => (item.get('id') === itemId));
  return matchingItem !== undefined;
};
// /**
//  * @todo - implement another time
//  *
//  * @param {Number} targetValue
//  * @param {ConditionData} conditionData
//  * @returns {Boolean}
//  */
// export function doesMeetConditionOfOnTileType(targetValue, conditionData) {
//   const conditionValue = conditionData.value;
//   return false;
// };
