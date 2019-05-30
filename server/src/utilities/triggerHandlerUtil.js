import {TRIGGER_ID} from 'constants.shared/triggerIds';

import * as gamestateCharacterHelper from 'helpers/gamestateCharacterHelper';
import * as itemDataHelper from 'helpers.shared/itemDataHelper';

import ItemModel from 'models.shared/ItemModel';

import logger from 'utilities/logger.game';

import * as conditionUtils from 'utilities.shared/conditionUtils';
import * as jsonDataUtils from 'utilities.shared/jsonDataUtils';

/**
 * resolves an individual TriggerData for the character
 * @todo - I intentionally separated these into separate functions even though they are a simple +/- in anticipation
 *  of different side effects needing to be handled in the future
 *
 * @param {TriggerData} triggerData
 * @param {CharacterModel} characterModel
 */
export function resolveTrigger(triggerData, characterModel) {
  // first check if this character meets the condition for this Trigger
  const conditionList = jsonDataUtils.getConditionList(triggerData);
  if (!conditionUtils.doesMeetAllConditions(characterModel, conditionList)) {
    return;
  }

  const {triggerId} = triggerData;
  logger.verbose(`. [[resolving trigger '${triggerId}']]`);

  //
  if (triggerId === TRIGGER_ID.GIVE_ITEM) {
    handleGiveItemTrigger(triggerData, characterModel);
  }
  // Add Candy
  if (triggerId === TRIGGER_ID.CANDY.ADD) {
    handleAddCandyTrigger(triggerData, characterModel);
  }
  // Lose Candy
  if (triggerId === TRIGGER_ID.CANDY.SUBTRACT) {
    handleLoseCandyTrigger(triggerData, characterModel);
  }

  //
  if (triggerId === TRIGGER_ID.HEALTH.ADD) {
    handleAddHealthTrigger(triggerData, characterModel);
  }
  //
  if (triggerId === TRIGGER_ID.HEALTH.SUBTRACT) {
    handleLoseHealthTrigger(triggerData, characterModel);
  }

  //
  if (triggerId === TRIGGER_ID.MOVEMENT.ADD) {
    handleAddMovementTrigger(triggerData, characterModel);
  }
  //
  if (triggerId === TRIGGER_ID.MOVEMENT.SUBTRACT) {
    handleLoseMovementTrigger(triggerData, characterModel);
  }

  //
  if (triggerId === TRIGGER_ID.SANITY.ADD) {
    handleAddSanityTrigger(triggerData, characterModel);
  }
  //
  if (triggerId === TRIGGER_ID.SANITY.SUBTRACT) {
    handleLoseSanityTrigger(triggerData, characterModel);
  }

  //
  if (triggerId === TRIGGER_ID.VISION.ADD) {
    handleAddVisionTrigger(triggerData, characterModel);
  }
  //
  if (triggerId === TRIGGER_ID.VISION.SUBTRACT) {
    handleLoseVisionTrigger(triggerData, characterModel);
  }

  //
  if (triggerId === TRIGGER_ID.LUCK.ADD) {
    handleAddLuckTrigger(triggerData, characterModel);
  }
  //
  if (triggerId === TRIGGER_ID.LUCK.SUBTRACT) {
    handleLoseLuckTrigger(triggerData, characterModel);
  }

  //
  if (triggerId === TRIGGER_ID.GREED.ADD) {
    handleAddGreedTrigger(triggerData, characterModel);
  }
  //
  if (triggerId === TRIGGER_ID.GREED.SUBTRACT) {
    handleLoseGreedTrigger(triggerData, characterModel);
  }

  //
  if (triggerId === TRIGGER_ID.CHANGE_LOCATION) {
    handleChangeLocationTrigger(triggerData, characterModel);
  }
}
/**
 * handles giving an item to character via trigger
 *
 * @param {TriggerData} triggerData
 * @param {CharacterModel} characterModel
 */
export function handleGiveItemTrigger(triggerData, characterModel) {
  const {
    itemId,
    value,
  } = triggerData;

  const itemData = itemDataHelper.getItemDataById(itemId);
  if (itemData === undefined) {
    logger.error(`handleGiveItemTrigger() - failed to find ${itemId}`);
    return;
  }

  const createdItemModel = new ItemModel({
    ...itemData,
    quantity: value,
  });
  characterModel.addToArray('inventory', createdItemModel);
};
/**
 * handles the basic Trigger of adding candy
 *
 * @param {TriggerData} triggerData
 * @param {CharacterModel} characterModel
 */
export function handleAddCandyTrigger(triggerData, characterModel) {
  const {value} = triggerData;

  const prevCandyCount = characterModel.get('candies');
  characterModel.set({candies: prevCandyCount + value});
};
/**
 * handles the basic Trigger of subtracting candy
 *
 * @param {TriggerData} triggerData
 * @param {CharacterModel} characterModel
 */
export function handleLoseCandyTrigger(triggerData, characterModel) {
  const {value} = triggerData;

  const prevCandyCount = characterModel.get('candies');
  characterModel.set({candies: prevCandyCount - value});
};
/**
 *
 *
 * @param {TriggerData} triggerData
 * @param {CharacterModel} characterModel
 */
export function handleAddHealthTrigger(triggerData, characterModel) {
  const {value} = triggerData;

  const prevValue = characterModel.get('health');
  characterModel.set({health: prevValue + value});
};
/**
 *
 *
 * @param {TriggerData} triggerData
 * @param {CharacterModel} characterModel
 */
export function handleLoseHealthTrigger(triggerData, characterModel) {
  const {value} = triggerData;

  const prevValue = characterModel.get('health');
  characterModel.set({health: prevValue - value});
};
/**
 *
 *
 * @param {TriggerData} triggerData
 * @param {CharacterModel} characterModel
 */
export function handleAddMovementTrigger(triggerData, characterModel) {
  const {value} = triggerData;

  const prevValue = characterModel.get('movement');
  characterModel.set({movement: prevValue + value});
};
/**
 *
 *
 * @param {TriggerData} triggerData
 * @param {CharacterModel} characterModel
 */
export function handleLoseMovementTrigger(triggerData, characterModel) {
  const {value} = triggerData;

  const prevValue = characterModel.get('movement');
  characterModel.set({movement: prevValue - value});
};
/**
 *
 *
 * @param {TriggerData} triggerData
 * @param {CharacterModel} characterModel
 */
export function handleAddSanityTrigger(triggerData, characterModel) {
  const {value} = triggerData;

  const prevValue = characterModel.get('sanity');
  characterModel.set({sanity: prevValue + value});
};
/**
 *
 *
 * @param {TriggerData} triggerData
 * @param {CharacterModel} characterModel
 */
export function handleLoseSanityTrigger(triggerData, characterModel) {
  const {value} = triggerData;

  const prevValue = characterModel.get('sanity');
  characterModel.set({sanity: prevValue - value});
};
/**
 *
 *
 * @param {TriggerData} triggerData
 * @param {CharacterModel} characterModel
 */
export function handleAddVisionTrigger(triggerData, characterModel) {
  const {value} = triggerData;

  const prevValue = characterModel.get('vision');
  characterModel.set({vision: prevValue + value});
};
/**
 *
 *
 * @param {TriggerData} triggerData
 * @param {CharacterModel} characterModel
 */
export function handleLoseVisionTrigger(triggerData, characterModel) {
  const {value} = triggerData;

  const prevValue = characterModel.get('vision');
  characterModel.set({vision: prevValue - value});
};
/**
 *
 *
 * @param {TriggerData} triggerData
 * @param {CharacterModel} characterModel
 */
export function handleAddLuckTrigger(triggerData, characterModel) {
  const {value} = triggerData;

  const prevValue = characterModel.get('luck');
  characterModel.set({luck: prevValue + value});
};
/**
 *
 *
 * @param {TriggerData} triggerData
 * @param {CharacterModel} characterModel
 */
export function handleLoseLuckTrigger(triggerData, characterModel) {
  const {value} = triggerData;

  const prevValue = characterModel.get('luck');
  characterModel.set({luck: prevValue - value});
};
/**
 *
 *
 * @param {TriggerData} triggerData
 * @param {CharacterModel} characterModel
 */
export function handleAddGreedTrigger(triggerData, characterModel) {
  const {value} = triggerData;

  const prevValue = characterModel.get('greed');
  characterModel.set({greed: prevValue + value});
};
/**
 *
 *
 * @param {TriggerData} triggerData
 * @param {CharacterModel} characterModel
 */
export function handleLoseGreedTrigger(triggerData, characterModel) {
  const {value} = triggerData;

  const prevValue = characterModel.get('greed');
  characterModel.set({greed: prevValue - value});
};
/**
 * @todo - does this belong here since it uses the helper...?
 *
 * @param {TriggerData} triggerData
 * @param {CharacterModel} characterModel
 */
export function handleChangeLocationTrigger(triggerData, characterModel) {
  const {value} = triggerData;
  const nextPoint = new Point(value.x, value.y);

  // gameState.addToActionQueue(() => {
  gamestateCharacterHelper.updateCharacterPosition(characterModel, nextPoint);
  // })
};
