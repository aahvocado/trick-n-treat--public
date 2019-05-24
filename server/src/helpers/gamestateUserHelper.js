import Point from '@studiomoniker/point';

import {FastCharacter} from 'collections/characterCollection';

import {CLIENT_TYPES} from 'constants.shared/clientTypes';
import {CLIENT_ACTIONS, isMovementAction} from 'constants.shared/clientActions';
import {ENCOUNTER_ACTION_ID} from 'constants.shared/encounterActions';
import {GAME_MODES} from 'constants.shared/gameModes';
import {MAP_START} from 'constants/mapSettings';
import {POINTS} from 'constants/points';

import * as clientEventHelper from 'helpers/clientEventHelper';
import * as gamestateCharacterHelper from 'helpers/gamestateCharacterHelper';
import * as gamestateEncounterHelper from 'helpers/gamestateEncounterHelper';

import UserModel from 'models.shared/UserModel';

import gameState from 'state/gameState';
import serverState from 'state/serverState';

import logger from 'utilities/logger.game';
import * as conditionHandlerUtils from 'utilities/conditionHandlerUtils';
import * as triggerHandlerUtil from 'utilities/triggerHandlerUtil';

import * as jsonDataUtils from 'utilities.shared/jsonDataUtils';

/**
 * this Helper is for handling actions from the User
 */

/**
 * makes Game Users out of given Client
 *
 * @param {SocketClientModel} clientModel
 * @returns {UserModel | undefined} - returns the created `userModel`
 */
export function createUserFromClient(clientModel) {
  // only make users out of those in Game and Remote Clients
  if (!clientModel.get('isInGame') || clientModel.get('clientType') !== CLIENT_TYPES.REMOTE) {
    return undefined;
  }

  const name = clientModel.get('name');
  const characterId = `${name}-character-id`;
  const userId = clientModel.get('userId');

  const newCharPosition = MAP_START.clone();
  const newCharacterModel = new FastCharacter({
    position: newCharPosition,
    name: `${name}-character`,
    characterId: characterId,
  });

  const newUserModel = new UserModel({
    name: name,
    characterId: characterId,
    userId: userId,
  });

  // add
  logger.game(`User "${clientModel.get('name')}" joined the game.`);
  gameState.addCharacter(newCharacterModel);
  gameState.addUser(newUserModel);
  return newUserModel;
}
/**
 * Client is joining a game in session
 *
 * @param {SocketClientModel} clientModel
 */
export function handleJoinGame(clientModel) {
  // can't join an inactive game
  if (gameState.get('mode') === GAME_MODES.INACTIVE) {
    return;
  }

  // only allow existing rejoins for now
  const userId = clientModel.get('userId');
  const existingUser = gameState.findUserById(userId);
  if (existingUser === undefined) {
    logger.game('Not allowing new Users for now');
    return;
  };

  // update and send
  clientModel.set({
    isInLobby: false,
    isInGame: true,
  });

  // give updates to the client
  clientEventHelper.sendUpdateToClient(clientModel);

  // check if the user rejoined and it is actually their turn
  const activeUser = gameState.get('activeUser');
  const isActiveUser = activeUser.get('userId') === userId;

  // check if there is an `activeEncounter` to send them to finish
  const activeEncounter = gameState.get('activeEncounter');
  if (isActiveUser && activeEncounter !== null) {
    clientEventHelper.sendEncounterToClient(clientModel, activeEncounter);
  }
}
/**
 * updates every User's actions
 */
export function updateActionsForAllUsers() {
  gameState.get('users').forEach((userModel) => {
    updateMovementActionsForUser(userModel);
  });
}
/**
 * updates all `canMove` attributes in a given user
 *
 * @param {UserModel} userModel
 */
export function updateMovementActionsForUser(userModel) {
  const characterId = userModel.get('characterId');
  const characterModel = gameState.findCharacterById(characterId);

  userModel.set({
    canMoveLeft: gameState.isWalkableAt(characterModel.getPotentialPosition(POINTS.LEFT)),
    canMoveRight: gameState.isWalkableAt(characterModel.getPotentialPosition(POINTS.RIGHT)),
    canMoveUp: gameState.isWalkableAt(characterModel.getPotentialPosition(POINTS.UP)),
    canMoveDown: gameState.isWalkableAt(characterModel.getPotentialPosition(POINTS.DOWN)),
  });
}
/**
 * a User's Action was finished
 *
 * @param {UserModel} userModel
 */
export function onUserActionComplete(userModel) {
  // clear the `activeEncounter`
  gameState.set({activeEncounter: null});

  // check if character's movement is now 0
  const characterModel = gameState.findCharacterByUserId(userModel.get('userId'));
  if (!characterModel.canMove()) {
    // end their turn
    gameState.addToActionQueue(() => {
      onUserTurnComplete(userModel);
    });
  }

  // after they finish an action, we should update the Client
  const clientModel = serverState.findClientByUser(userModel);
  clientEventHelper.sendUpdateToClient(clientModel);
}
/**
 * a User's Turn finished
 *
 * @param {UserModel} userModel
 */
export function onUserTurnComplete(userModel) {
  userModel.set({
    isUserTurn: false,
  });

  // next turn
  gameState.addToActionQueue(() => {
    gameState.handleEndOfTurn();
  });
}
/**
 * User did something
 *
 * @param {String} userId
 * @param {String} actionId
 */
export function handleUserGameAction(userId, actionId) {
  // check if it is the Turn of the user who clicked
  const activeUser = gameState.get('activeUser');
  if (activeUser.get('userId') !== userId) {
    return;
  }

  // handle movement actions
  if (isMovementAction(actionId)) {
    gameState.addToActionQueue(() => {
      handleUserActionMove(userId, actionId);
    });
    return;
  }
}
/**
 * user asked to move
 *
 * @param {String} userId
 * @param {String} actionId
 */
export function handleUserActionMove(userId, actionId) {
  const characterModel = gameState.findCharacterByUserId(userId);
  if (!characterModel.canMove()) {
    return;
  }

  if (actionId === CLIENT_ACTIONS.MOVE.LEFT) {
    gamestateCharacterHelper.updateCharacterPositionByDirection(characterModel, 'left');
  }

  if (actionId === CLIENT_ACTIONS.MOVE.RIGHT) {
    gamestateCharacterHelper.updateCharacterPositionByDirection(characterModel, 'right');
  }

  if (actionId === CLIENT_ACTIONS.MOVE.UP) {
    gamestateCharacterHelper.updateCharacterPositionByDirection(characterModel, 'up');
  }

  if (actionId === CLIENT_ACTIONS.MOVE.DOWN) {
    gamestateCharacterHelper.updateCharacterPositionByDirection(characterModel, 'down');
  }

  // after the move, they lose a movement
  characterModel.modifyStat('movement', -1);

  // action complete
  const userModel = gameState.findUserById(userId);
  gameState.addToActionQueue(() => {
    onUserActionComplete(userModel);
  });
}
/**
 * user wants to Move to a specific spot
 *
 * @param {String} userId
 * @param {Point} endPosition
 */
export function handleUserActionMoveTo(userId, endPosition) {
  const characterModel = gameState.findCharacterByUserId(userId);
  const endPoint = new Point(endPosition.x, endPosition.y);
  gamestateCharacterHelper.handleMoveCharacterTo(characterModel, endPoint);
}
/**
 * User chosen an Action
 *
 * @param {String} userId
 * @param {EncounterId} encounterId
 * @param {ActionData} actionData
 */
export function handleUserEncounterAction(userId, encounterId, actionData) {
  // check if it is the Turn of the user who clicked
  const userModel = gameState.get('activeUser');
  const activeUserId = userModel.get('userId');
  if (activeUserId !== userId) {
    return;
  }

  // check if the encounter they clicked on actually is the current one
  const activeEncounter = gameState.get('activeEncounter');
  if (activeEncounter.get('id') !== encounterId) {
    logger.warning(`"${characterModel.get('name')}" clicked on an action that was not in the Active Encounter`);
    return;
  }

  // check if character was allowed to take this action
  const characterModel = gameState.get('activeCharacter');
  const conditionList = jsonDataUtils.getConditionList(actionData);
  if (!conditionHandlerUtils.doesMeetAllConditions(characterModel, conditionList)) {
    logger.warning(`"${characterModel.get('name')}" used an action in "${activeEncounter.get('title')}" but did not meet conditions`);
    return;
  }

  // finally, we can handle the action
  const {
    actionId,
    gotoId,
  } = actionData;

  // just a basic confirmation to close the `Encounter`
  if (actionId === ENCOUNTER_ACTION_ID.CONFIRM) {
    // tell the client their encounter is now null
    const clientModel = serverState.findClientByCharacter(characterModel);
    clientEventHelper.sendEncounterToClient(clientModel, null);

    // action is complete
    onUserActionComplete(userModel);
  }

  // this goes to another `Encounter`
  if (actionId === ENCOUNTER_ACTION_ID.GOTO) {
    gamestateEncounterHelper.handleEncounterActionGoTo(userModel, gotoId);
  }
}
/**
 * User used Item
 *
 * @param {String} userId
 * @param {ItemModel} itemModel
 */
export function handleUserUseItem(userId, itemModel) {
  const characterModel = gameState.findCharacterByUserId(userId);

  // remove item if consumable
  if (itemModel.get('isConsumable')) {
    const inventory = characterModel.get('inventory');
    const foundItemIdx = inventory.findIndex((inventoryItem) => (inventoryItem.get('id') === itemModel.get('id')));
    if (foundItemIdx >= 0) {
      inventory.splice(foundItemIdx, 1);
      characterModel.set({inventory: inventory});
    }
  }

  // check if character was allowed to use this item
  const conditionList = itemModel.get('conditionList');
  if (!conditionHandlerUtils.doesMeetAllConditions(characterModel, conditionList)) {
    logger.warning(`"${characterModel.get('name')}" attempted to use "${itemModel.get('name')}" but did not meet use conditions`);
    return;
  }

  // resolve all triggers for an item
  const triggerList = itemModel.get('triggerList');
  triggerList.forEach((triggerData) => {
    triggerHandlerUtil.resolveTrigger(triggerData, characterModel);
  });

  // send the client the data of the Encounter they triggered
  const clientModel = serverState.findClientByCharacter(characterModel);
  clientEventHelper.sendUpdateToClient(clientModel);
}

