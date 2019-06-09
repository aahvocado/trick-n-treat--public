import {CLIENT_TYPE} from 'constants.shared/clientTypes';
import {CHOICE_ID} from 'constants.shared/choiceIds';
import {GAME_MODE} from 'constants.shared/gameModes';
import {MAP_START} from 'constants/mapSettings';
import {TRIGGER_LOGIC_ID} from 'constants.shared/triggerLogicIds';

import {getEncounterDataById} from 'helpers.shared/encounterDataHelper';

import CharacterModel from 'models.shared/CharacterModel';
import EncounterModel from 'models.shared/EncounterModel';

import gameState from 'state/gameState';
import serverState from 'state/serverState';

import logger from 'utilities/logger.game';
import * as triggerHandlerUtil from 'utilities/triggerHandlerUtil';

import * as conditionUtils from 'utilities.shared/conditionUtils';
import * as mapUtils from 'utilities.shared/mapUtils';

/**
 * this Helper is for `gameState` stuff that relates to Characters
 */

// -- client-character functions
/**
 * makes Game Users out of given Client
 *
 * @param {ClientModel} clientModel
 * @returns {CharacterModel}
 */
export function createCharacterForClient(clientModel) {
  // only make users out of those in Game and Remote Clients
  if (!clientModel.get('isInGame') || clientModel.get('clientType') !== CLIENT_TYPE.REMOTE) {
    logger.error('Unable to create a Character for Client.');
    return;
  }

  const name = clientModel.get('name');
  const characterId = `${name}-character-id`;
  const clientId = clientModel.get('clientId');

  /** @todo - properly create character */
  const newCharacterModel = new CharacterModel({
    name: `${name}-character`,
    characterId: characterId,
    clientId: clientId,

    position: MAP_START.clone(),
    health: 4,
    movement: 4,
    sanity: 4,
    vision: 8,
  });

  // set the Character on the Client
  clientModel.set({myCharacter: newCharacterModel});

  // done
  logger.game(`User "${clientModel.get('name')}" joined the game.`);
  return newCharacterModel;
}
/**
 * client wants to rejoin
 *
 * @param {ClientModel} clientModel
 */
export function handleClientRejoin(clientModel) {
  // can't join an inactive game
  if (!gameState.get('isActive')) {
    return;
  }

  // only allow existing rejoins for now
  const clientId = clientModel.get('clientId');
  const existingCharacter = gameState.findCharacterByClientId(clientId);
  if (existingCharacter === undefined) {
    logger.game('Not allowing new Clients right now');
    return;
  };

  // update and send
  logger.game(`${clientModel.get('name')} successfully rejoined the game!`);
  clientModel.set({
    isInLobby: false,
    isInGame: true,
    myCharacter: existingCharacter,
  });

  // now that they've rejoined, update
  serverState.emitLobbyUpdate();
  serverState.emitGameUpdate();

  // check if the user rejoined and it is actually their turn
  const isCurrentCharacter = gameState.get('currentCharacter').get('clientId') === clientId;

  // check if there is an `activeEncounter` to send them to finish
  const activeEncounter = gameState.get('activeEncounter');
  if (isCurrentCharacter && activeEncounter !== null) {
    const clientModel = serverState.findClientByCharacter(characterModel);
    clientModel.emitEncounter(activeEncounter);
  }
}
// -- utility functions
/**
 * returns the Character whose is currently acting
 * (`null` probably means the game hasn't started, `undefined` means you bad)
 *
 * @returns {CharacterModel | null}
 */
export function getCurrentCharacter() {
  // `currentCharacter` is usually the first character in the `turnQueue`
  //  but if the queue is empty then there's no character either
  const turnQueue = gameState.get('turnQueue').slice();
  if (turnQueue.length <= 0) {
    return null;
  };

  // find the character marked with `isActive`
  const characterList = gameState.get('characterList').slice();
  const currentCharacter = characterList.find((characterModel) => {
    return characterModel.get('isActive');
  });

  return currentCharacter;
}
/**
 * finds all Characters at a given map Location
 *
 * @param {Point} point
 * @returns {Array<CharacterModel>}
 */
export function getCharactersAt(point) {
  return gameState.get('characterList').filter((characterModel) => (point.equals(characterModel.get('position'))));
}
/**
 * @param {String} characterId
 * @returns {CharacterModel | undefined}
 */
export function findCharacterById(characterId) {
  return gameState.get('characterList').find((characterModel) => {
    return characterModel.get('characterId') === characterId;
  });
}
/**
 * @param {String} clientId
 * @returns {CharacterModel | undefined}
 */
export function findCharacterByClientId(clientId) {
  return gameState.get('characterList').find((characterModel) => {
    return characterModel.get('clientId') === clientId;
  });
}
// -- action functions
/**
 * changes a Character's Position to given Position
 *
 * @param {CharacterModel} characterModel
 * @param {Point} position
 */
export function updateCharacterPosition(characterModel, position) {
  // nothing to do if given direction is not walkable
  if (!gameState.isWalkableAt(position)) {
    return;
  }

  // update the character's position
  characterModel.set({position: position});

  // update map visibility
  const vision = characterModel.get('vision');
  gameState.updateLightLevelsAt(position, vision);

  // send a game update
  serverState.emitGameUpdate();

  // finished if there is no Encounter here
  const encounterModel = gameState.findEncounterAt(position);
  if (encounterModel === undefined) {
    return;
  }

  // there is an Encounter, so add the handler to the front of the FunctionQueue
  gameState.insertIntoFunctionQueue(() => {
    gameState.handleCharacterTriggerEncounter(characterModel, encounterModel);
  }, 'handleCharacterTriggerEncounter');
}
/**
 * attempts to move a Character tile by tile to a position
 *
 * @param {CharacterModel} characterModel
 * @param {Point} position
 */
export function moveCharacterTo(characterModel, position) {
  if (!gameState.canCharacterDoStuff(characterModel)) {
    logger.warning(`"${characterModel.get('name')}" cannot do stuff right now.`);
    return;
  }

  // do nothing if destination is unwalkable
  if (!gameState.isWalkableAt(position)) {
    return;
  }

  // find the potential path the Character will walk,
  const characterPos = characterModel.get('position');
  const grid = mapUtils.createGridForPathfinding(gameState.get('tileMapModel').get('matrix'));
  const movePath = mapUtils.getAStarPath(grid, characterPos, position);
  movePath.shift(); // remove the first point, which is the one the Character is on

  // check if destination is too far away
  const movement = characterModel.get('movement');
  if (movePath.length > movement) {
    return;
  }

  logger.verbose(`(moving "${characterModel.get('name')}" from [${characterPos.toArray()}] to [${position.toArray()}])`);

  // take one step at a time for moving along the path
  movePath.forEach((pathPoint) => {
    gameState.addToFunctionQueue(() => {
      // subtract a Movement
      characterModel.modifyStat('movement', -1);

      // attempt to update the character's position
      updateCharacterPosition(characterModel, pathPoint);
    }, 'moveCharacterTo');

    // lifecycle handle end of action between every step
    // (but if there is an Encounter, it will go in front of this)
    gameState.addToFunctionQueue(() => {
      gameState.handleEndOfAction(characterModel);
    }, 'handleEndOfAction');
  });
}
/**
 * Character used an Item
 *  the character must have the item to use it
 *
 * @param {CharacterModel} characterModel
 * @param {ItemModel} itemModel
 */
export function handleCharacterUseItem(characterModel, itemModel) {
  if (!gameState.canCharacterDoStuff(characterModel)) {
    logger.warning(`"${characterModel.get('name')}" cannot not do stuff right now.`);
    return;
  }

  if (!itemModel.get('isUseable')) {
    logger.warning(`"${characterModel.get('name')}" tried to use an unuseable item.`);
    return;
  }

  // character must have it
  if (!characterModel.hasItem(itemModel)) {
    logger.warning(`"${characterModel.get('name')}" tried to use "${itemModel.get('name')}" but does not have it.`);
    return;
  }

  // check if character was allowed to use characterModel item
  if (!characterModel.canUseItem(itemModel)) {
    logger.warning(`"${characterModel.get('name')}" tried to use "${itemModel.get('name')}" but does not meet use conditions.`);
    return;
  }

  // find the Exact Matching Item type in our inventory and find out how to consume it
  if (itemModel.get('isConsumable')) {
    // find the "exact match" item in Character's inventory
    // (using index in case we want to remove it completely)
    const inventory = characterModel.get('inventory');
    const foundItemIdx = inventory.findIndex((inventoryItem) => inventoryItem.get('id') === itemModel.get('id'));

    // not found
    if (foundItemIdx < 0) {
      logger.warning(`"${characterModel.get('name')}" does not have "${itemModel.get('name')}" to remove.`);
    } else {
      // grab the actual ItemModel and its quantity
      const exactItemModel = inventory[foundItemIdx];
      const itemQuantity = exactItemModel.get('quantity');

      // if there will be none left, remove it
      if (itemQuantity <= 1) {
        inventory.splice(foundItemIdx, 1);
        characterModel.set({inventory: inventory});
      }

      // otherwise we can just subtract one from the item's quantity
      if (itemQuantity > 1) {
        exactItemModel.set({quantity: itemQuantity - 1});
      }
    }
  }

  // resolve triggers
  const triggerList = itemModel.get('triggerList');
  triggerList.forEach((triggerData) => {
    triggerHandlerUtil.resolveTrigger(triggerData, characterModel);
  });

  // update
  serverState.emitGameUpdate();
}
/**
 * Character has chosen an Action
 *
 * @todo - I'm planning on letting CPU be able to do this too
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterId} encounterId
 * @param {ActionData} actionData
 */
export function handleCharacterChoseAction(characterModel, encounterId, actionData) {
  if (!gameState.canCharacterDoStuff(characterModel)) {
    logger.warning(`"${characterModel.get('name')}" cannot do stuff right now.`);
    return;
  }

  // check if the encounter they clicked on actually is the current one
  const activeEncounter = gameState.get('activeEncounter');
  if (activeEncounter.get('id') !== encounterId) {
    logger.warning(`"${characterModel.get('name')}" clicked on an action in an Encounter that was not the "ActiveEncounter".`);
    return;
  }

  // check if character was allowed to take this action
  if (!conditionUtils.doesMeetAllConditions(actionData.conditionList, characterModel, activeEncounter)) {
    logger.warning(`"${characterModel.get('name')}" used an action in "${activeEncounter.get('title')}" but did not meet conditions`);
    return;
  }

  // finally, this action is valid but we need to handle that lifecycle first
  gameState.addToFunctionQueue(() => {
    gameState.handleStartOfAction();
  }, 'handleStartOfAction');

  // look at the choice, if it's a basic confirmation to close the `Encounter`
  const {choiceId} = actionData;
  if (choiceId === CHOICE_ID.CONFIRM) {
    // add the simple function of closing the encounter to the queue
    gameState.addToFunctionQueue(() => {
      // clear out `activeEncounter`
      gameState.set({activeEncounter: null});

      // tell the client their encounter is now null
      const clientModel = serverState.findClientByCharacter(characterModel);
      clientModel.emitEncounterClose();
    }, 'closeEncounter');
  }

  // everything else goes to another Encounter
  //  so we're going to find the data of the Encounter it is going to and create a Model out of it
  const nextEncounterData = getEncounterDataById(actionData.gotoId);
  const nextEncounterModel = new EncounterModel(nextEncounterData);

  // choice goes to another `Encounter`
  if (choiceId === CHOICE_ID.GOTO) {
    gameState.addToFunctionQueue(() => {
      gameState.handleChoiceGoTo(characterModel, nextEncounterModel);
    }, 'handleChoiceGoTo');
  }

  // choice is a "Trick"
  if (choiceId === CHOICE_ID.TRICK) {
    gameState.addToFunctionQueue(() => {
      gameState.handleChoiceTrick(characterModel, nextEncounterModel);
    }, 'handleChoiceTrick');
  }

  // choice is a "Treat"
  if (choiceId === CHOICE_ID.TREAT) {
    gameState.addToFunctionQueue(() => {
      gameState.handleChoiceTreat(characterModel, nextEncounterModel);
    }, 'handleChoiceTreat');
  }

  // always handle end of action lifecycle
  gameState.addToFunctionQueue(() => {
    gameState.handleEndOfAction(characterModel);
  }, 'handleEndOfAction');
}
/**
 * picks a random adjacent point that a given character can be on
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterModel} encounterModel
 */
export function handleCharacterTriggerEncounter(characterModel, encounterModel) {
  const encounterLocation = encounterModel.get('location');
  logger.verbose(`(encountered "${encounterModel.get('id')}" at [${encounterLocation.toArray()}])`);

  // check if the character on here can actually trigger this
  if (!encounterModel.canBeEncounteredBy(characterModel)) {
    logger.verbose(`. but ${characterModel.get('name')} can not activate it.`);
    return;
  }

  // track the `activeEncounter`
  gameState.set({activeEncounter: encounterModel});

  // clear the FunctionQueue because we have to handle this immediately and not anything else
  //  this might cause issues and skip events, so we need to keep an eye on this
  gameState.clearFunctionQueue();

  // resolve all the triggers (at once)
  const triggerList = encounterModel.get('triggerList');
  triggerList.forEach((triggerData) => {
    // check if this Character meets the individual condition for this Trigger
    if (!conditionUtils.doesMeetAllConditions(triggerData.conditionList, characterModel, encounterModel)) {
      return;
    }

    // unique to Encounters, mark the Encounter to be deleted later
    if (triggerData.triggerLogicId === TRIGGER_LOGIC_ID.DELETE) {
      encounterModel.set({isMarkedForDeletion: true});
      return;
    }

    // resolve it
    triggerHandlerUtil.resolveTrigger(triggerData, characterModel);
  });

  // add a visit - specifically after the Triggers
  encounterModel.get('visitors').push(characterModel);

  // send the client the Encounter they just triggered
  const clientModel = serverState.findClientByCharacter(characterModel);
  clientModel.emitEncounter(encounterModel);

  // set game mode to ready so the client can respond
  gameState.set({mode: GAME_MODE.WAITING});
}
/**
 * the Choice takes the Character to another Encounter
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterModel} encounterModel
 */
export function handleChoiceGoTo(characterModel, encounterModel) {
  logger.verbose(`. (Choice goes to ${encounterModel.get('id')})`);
  gameState.handleCharacterTriggerEncounter(characterModel, encounterModel);
};
/**
 * Trick choice
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterModel} encounterModel
 */
export function handleChoiceTrick(characterModel, encounterModel) {
  encounterModel.get('trickers').push(characterModel);

  logger.verbose(`. (Trick choice goes to ${encounterModel.get('id')})`);
  gameState.handleCharacterTriggerEncounter(characterModel, encounterModel);
};
/**
 * Treat choice
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterModel} encounterModel
 */
export function handleChoiceTreat(characterModel, encounterModel) {
  encounterModel.get('treaters').push(characterModel);

  logger.verbose(`. (Treat choice goes to "${encounterModel.get('id')}")`);
  gameState.handleCharacterTriggerEncounter(characterModel, encounterModel);
};
