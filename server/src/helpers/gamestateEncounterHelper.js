import Point from '@studiomoniker/point';

import {ENCOUNTER_TRIGGER_ID} from 'constants.shared/encounterTriggers';

import gameState from 'data/gameState';

import EncounterModel from 'models/EncounterModel';

import * as gamestateActionHelper from 'helpers/gamestateActionHelper';
import * as gamestateCharacterHelper from 'helpers/gamestateCharacterHelper';
import {getEncounterDataById} from 'helpers.shared/encounterDataHelper';

import {sendEncounterToClientByUser} from 'managers/clientManager';

import logger from 'utilities/logger.game';

/**
 * this Helper is for handling data for Encounters
 */

/**
 * picks a random adjacent point that a given character can be on
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterModel} encounterModel
 */
export function handleCharacterTriggerEncounter(characterModel, encounterModel) {
  const encounterLocation = encounterModel.get('location');
  logger.verbose(`(encounter at [x: ${encounterLocation.x}, y: ${encounterLocation.y}])`);

  // check if the character on here can actually trigger this
  if (!encounterModel.canTrigger(characterModel)) {
    return;
  }

  // clear the actionQueue because we have to handle this immediately
  //  this might cause issues and skip events, so we need to keep an eye on this
  gamestateActionHelper.clearActionQueue();

  // first resolve all the triggers
  resolveTriggerList(encounterModel, characterModel);

  // then update the Encounter to say it has been
  encounterModel.trigger(characterModel);

  // send the client the data of the Encounter they triggered
  const userModel = gameState.findUserByCharacterId(characterModel.get('characterId'));
  sendEncounterToClientByUser(userModel, encounterModel.exportEncounterData());
}
/**
 *
 *
 * @param {UserModel} userModel
 * @param {EncounterId} encounterId
 */
export function sendEncounterToUser(userModel, encounterId) {
  logger.verbose(`(directly sending encounter to ${userModel.get('name')})`);

  const encounterData = getEncounterDataById(encounterId);
  const newEncounterModel = new EncounterModel(encounterData);

  handleCharacterTriggerEncounter(userModel, newEncounterModel);
};

/**
 * handles each of the triggers in an encounter
 * @todo - I intentionally separated these into separate functions even though they are a simple +/- in anticipation
 *  of different side effects needing to be handled in the future
 *
 * @param {EncounterModel} encounterModel
 * @param {CharacterModel} characterModel
 */
export function resolveTriggerList(encounterModel, characterModel) {
  logger.new(`[[resolving Triggers in "${encounterModel.get('id')}"]]`)
  const triggerList = encounterModel.get('triggerList');
  triggerList.forEach((triggerData) => {
    const {triggerId} = triggerData;
    logger.verbose(`. [[resolving trigger '${triggerId}']]`);

    // Add Candy
    if (triggerId === ENCOUNTER_TRIGGER_ID.CANDY.ADD) {
      handleAddCandyTrigger(characterModel, triggerData);
    }
    // Lose Candy
    if (triggerId === ENCOUNTER_TRIGGER_ID.CANDY.SUBTRACT) {
      handleLoseCandyTrigger(characterModel, triggerData);
    }

    //
    if (triggerId === ENCOUNTER_TRIGGER_ID.HEALTH.ADD) {
      handleAddHealthTrigger(characterModel, triggerData);
    }
    //
    if (triggerId === ENCOUNTER_TRIGGER_ID.HEALTH.SUBTRACT) {
      handleLoseHealthTrigger(characterModel, triggerData);
    }

    //
    if (triggerId === ENCOUNTER_TRIGGER_ID.MOVEMENT.ADD) {
      handleAddMovementTrigger(characterModel, triggerData);
    }
    //
    if (triggerId === ENCOUNTER_TRIGGER_ID.MOVEMENT.SUBTRACT) {
      handleLoseMovementTrigger(characterModel, triggerData);
    }

    //
    if (triggerId === ENCOUNTER_TRIGGER_ID.SANITY.ADD) {
      handleAddSanityTrigger(characterModel, triggerData);
    }
    //
    if (triggerId === ENCOUNTER_TRIGGER_ID.SANITY.SUBTRACT) {
      handleLoseSanityTrigger(characterModel, triggerData);
    }

    //
    if (triggerId === ENCOUNTER_TRIGGER_ID.VISION.ADD) {
      handleAddVisionTrigger(characterModel, triggerData);
    }
    //
    if (triggerId === ENCOUNTER_TRIGGER_ID.VISION.SUBTRACT) {
      handleLoseVisionTrigger(characterModel, triggerData);
    }

    //
    if (triggerId === ENCOUNTER_TRIGGER_ID.LUCK.ADD) {
      handleAddLuckTrigger(characterModel, triggerData);
    }
    //
    if (triggerId === ENCOUNTER_TRIGGER_ID.LUCK.SUBTRACT) {
      handleLoseLuckTrigger(characterModel, triggerData);
    }

    //
    if (triggerId === ENCOUNTER_TRIGGER_ID.GREED.ADD) {
      handleAddGreedTrigger(characterModel, triggerData);
    }
    //
    if (triggerId === ENCOUNTER_TRIGGER_ID.GREED.SUBTRACT) {
      handleLoseGreedTrigger(characterModel, triggerData);
    }

    //
    if (triggerId === ENCOUNTER_TRIGGER_ID.CHANGE_POSITION) {
      handleChangePositionTrigger(characterModel, triggerData);
    }
  });

  logger.old(`[[done resolving Triggers]]`);
}
/**
 * handles the basic Encounter Trigger of adding candy
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterTriggerData} triggerData
 */
export function handleAddCandyTrigger(characterModel, triggerData) {
  const {value} = triggerData;

  const prevCandyCount = characterModel.get('candies');
  characterModel.set({candies: prevCandyCount + value});
};
/**
 * handles the basic Encounter Trigger of subtracting candy
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterTriggerData} triggerData
 */
export function handleLoseCandyTrigger(characterModel, triggerData) {
  const {value} = triggerData;

  const prevCandyCount = characterModel.get('candies');
  characterModel.set({candies: prevCandyCount - value});
};
/**
 *
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterTriggerData} triggerData
 */
export function handleAddHealthTrigger(characterModel, triggerData) {
  const {value} = triggerData;

  const prevValue = characterModel.get('health');
  characterModel.set({health: prevValue + value});
};
/**
 *
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterTriggerData} triggerData
 */
export function handleLoseHealthTrigger(characterModel, triggerData) {
  const {value} = triggerData;

  const prevValue = characterModel.get('health');
  characterModel.set({health: prevValue - value});
};
/**
 *
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterTriggerData} triggerData
 */
export function handleAddMovementTrigger(characterModel, triggerData) {
  const {value} = triggerData;

  const prevValue = characterModel.get('movement');
  characterModel.set({movement: prevValue + value});
};
/**
 *
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterTriggerData} triggerData
 */
export function handleLoseMovementTrigger(characterModel, triggerData) {
  const {value} = triggerData;

  const prevValue = characterModel.get('movement');
  characterModel.set({movement: prevValue - value});
};
/**
 *
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterTriggerData} triggerData
 */
export function handleAddSanityTrigger(characterModel, triggerData) {
  const {value} = triggerData;

  const prevValue = characterModel.get('sanity');
  characterModel.set({sanity: prevValue + value});
};
/**
 *
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterTriggerData} triggerData
 */
export function handleLoseSanityTrigger(characterModel, triggerData) {
  const {value} = triggerData;

  const prevValue = characterModel.get('sanity');
  characterModel.set({sanity: prevValue - value});
};
/**
 *
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterTriggerData} triggerData
 */
export function handleAddVisionTrigger(characterModel, triggerData) {
  const {value} = triggerData;

  const prevValue = characterModel.get('vision');
  characterModel.set({vision: prevValue + value});
};
/**
 *
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterTriggerData} triggerData
 */
export function handleLoseVisionTrigger(characterModel, triggerData) {
  const {value} = triggerData;

  const prevValue = characterModel.get('vision');
  characterModel.set({vision: prevValue - value});
};
/**
 *
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterTriggerData} triggerData
 */
export function handleAddLuckTrigger(characterModel, triggerData) {
  const {value} = triggerData;

  const prevValue = characterModel.get('luck');
  characterModel.set({luck: prevValue + value});
};
/**
 *
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterTriggerData} triggerData
 */
export function handleLoseLuckTrigger(characterModel, triggerData) {
  const {value} = triggerData;

  const prevValue = characterModel.get('luck');
  characterModel.set({luck: prevValue - value});
};
/**
 *
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterTriggerData} triggerData
 */
export function handleAddGreedTrigger(characterModel, triggerData) {
  const {value} = triggerData;

  const prevValue = characterModel.get('greed');
  characterModel.set({greed: prevValue + value});
};
/**
 *
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterTriggerData} triggerData
 */
export function handleLoseGreedTrigger(characterModel, triggerData) {
  const {value} = triggerData;

  const prevValue = characterModel.get('greed');
  characterModel.set({greed: prevValue - value});
};
/**
 *
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterTriggerData} triggerData
 */
export function handleChangePositionTrigger(characterModel, triggerData) {
  const {value} = triggerData;
  const nextPoint = new Point(value.x, value.y);

  // gameState.addToActionQueue(() => {
  gamestateCharacterHelper.updateCharacterPosition(characterModel, nextPoint);
  // })
};
