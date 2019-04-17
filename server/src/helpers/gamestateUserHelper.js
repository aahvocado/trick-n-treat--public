import Point from '@studiomoniker/point';

import {FastCharacter} from 'collections/characterCollection';

import {CLIENT_TYPES} from 'constants/clientTypes';
import {CLIENT_ACTIONS, isMovementAction} from 'constants/clientActions';
import {GAME_MODES} from 'constants/gameModes';
import {MAP_START} from 'constants/mapSettings';
import {POINTS} from 'constants/points';

import gameState from 'data/gameState';

import * as gamestateCharacterHelper from 'helpers/gamestateCharacterHelper';

import {sendUpdateToClientByUser} from 'managers/clientManager';

import UserModel from 'models/UserModel';

import logger from 'utilities/logger';

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

  sendUpdateToClientByUser(existingUser);
}
/**
 * @param {String} userId
 * @returns {Object}
 */
export function getClientUserAndCharacter(userId) {
  const characterModel = gameState.findCharacterByUserId(userId);
  const userModel = gameState.findUserById(userId);

  if (characterModel === undefined || userModel === undefined) {
    return;
  }

  return {
    myCharacter: characterModel.export(),
    myUser: userModel.export(),
  };
}
/**
 * updates every User's actions
 */
export function updateActionsForAllUsers() {
  gameState.get('users').forEach((userModel) => {
    updateMovementActionsForUser(userModel);
    updateLocationActionsForUser(userModel);
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
 * updates `canTrick` and `canTreat` attributes in a given user
 *
 * @param {UserModel} userModel
 */
export function updateLocationActionsForUser(userModel) {
  const characterId = userModel.get('characterId');
  const characterModel = gameState.findCharacterById(characterId);
  const characterPosition = characterModel.get('position');

  const houseModelHere = gameState.findHouseAt(characterPosition);
  if (houseModelHere === undefined) {
    userModel.set({
      canTrick: false,
      canTreat: false,
    });
    return;
  };

  userModel.set({
    canTrick: houseModelHere.isTrickable(characterModel),
    canTreat: houseModelHere.isTreatable(characterModel),
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

  //
  if (actionId === CLIENT_ACTIONS.TRICK) {
    gameState.addToActionQueue(() => {
      handleUserActionTrick(userId);
    });
  }
  if (actionId === CLIENT_ACTIONS.TREAT) {
    gameState.addToActionQueue(() => {
      handleUserActionTreat(userId);
    });
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
 * user wants to Treat
 *
 * @param {String} userId
 */
export function handleUserActionTreat(userId) {
  const characterModel = gameState.findCharacterByUserId(userId);
  const characterPosition = characterModel.get('position');

  // are you doing this at a house?
  const houseModelHere = gameState.findHouseAt(characterPosition);
  if (houseModelHere === undefined) {
    return;
  }

  // are you allowed to do this here?
  if (!houseModelHere.isTreatable(characterModel)) {
    return;
  }

  // ok cool
  houseModelHere.triggerTreat(characterModel);

  // action complete
  const userModel = gameState.findUserById(userId);
  gameState.addToActionQueue(() => {
    onUserActionComplete(userModel);
  });
}
/**
 * user wants to Trick
 *
 * @param {String} userId
 */
export function handleUserActionTrick(userId) {
  const characterModel = gameState.findCharacterByUserId(userId);
  const characterPosition = characterModel.get('position');

  // are you doing this at a house?
  const houseModelHere = gameState.findHouseAt(characterPosition);
  if (houseModelHere === undefined) {
    return;
  }

  // are you allowed to do this here?
  if (!houseModelHere.isTrickable(characterModel)) {
    return;
  }

  // ok cool
  houseModelHere.triggerTrick(characterModel);

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
 * a User's Action was finished
 *
 * @param {UserModel} userModel
 */
export function onUserActionComplete(userModel) {
  // a character's movement is now 0, end User's available actions
  const characterModel = gameState.findCharacterByUserId(userModel.get('userId'));
  if (!characterModel.canMove()) {
    gameState.addToActionQueue(() => {
      onUserTurnComplete(userModel);
    });
  }

  // after they finish an action, we should update the Client
  sendUpdateToClientByUser(userModel);
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
