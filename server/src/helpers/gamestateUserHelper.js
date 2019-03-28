import Point from '@studiomoniker/point';

import {FastCharacter} from 'collections/characterCollection';

import {CLIENT_TYPES} from 'constants/clientTypes';
import {CLIENT_ACTIONS, isMovementAction} from 'constants/clientActions';
import {GAME_MODES} from 'constants/gameModes';
import {MAP_START} from 'constants/mapSettings';

import POINTS from 'constants/points';

import gameState from 'data/gameState';

import UserModel from 'models/UserModel';

import * as gamestateCharacterHelper from 'helpers/gamestateCharacterHelper';

import * as matrixUtils from 'utilities/matrixUtils';

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

  // if this Client has an existing User, no need to create another one
  const userId = clientModel.get('userId');
  const existingUser = gameState.findUserById(userId);
  if (existingUser !== undefined) {
    return undefined;
  }

  const name = clientModel.get('name');
  const characterId = `${name}-character-id`;

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
  gameState.addCharacter(newCharacterModel);
  gameState.addUser(newUserModel);
  return newUserModel;
}
/**
 * Client is joining a game in session
 *
 * @param {SocketClientModel} socketClient
 */
export function handleJoinGame(socketClient) {
  // can't join an inactive game
  if (gameState.get('mode') === GAME_MODES.INACTIVE) {
    return;
  }

  socketClient.set({
    isInLobby: false,
    isInGame: true,
  });

  createUserFromClient(socketClient);
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
    handleUserActionMove(userId, actionId);
    return;
  }

  //
  if (actionId === CLIENT_ACTIONS.TRICK) {
    handleUserActionTrick(userId);
  }
  if (actionId === CLIENT_ACTIONS.TREAT) {
    handleUserActionTreat(userId);
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
    gamestateCharacterHelper.updateCharacterPosition(userId, 'left');
  }

  if (actionId === CLIENT_ACTIONS.MOVE.RIGHT) {
    gamestateCharacterHelper.updateCharacterPosition(userId, 'right');
  }

  if (actionId === CLIENT_ACTIONS.MOVE.UP) {
    gamestateCharacterHelper.updateCharacterPosition(userId, 'up');
  }

  if (actionId === CLIENT_ACTIONS.MOVE.DOWN) {
    gamestateCharacterHelper.updateCharacterPosition(userId, 'down');
  }

  // after the move, they lose a movement
  characterModel.modifyStat('movement', -1);

  // if they're now down to zero, end User's available actions
  if (!characterModel.canMove()) {
    onUserActionComplete(userId);
  }
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

  // end Actions
  onUserActionComplete(userId);
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

  // end Actions
  onUserActionComplete(userId);
}
/**
 * user wants to Move to a specific spot
 *
 * @param {String} userId
 * @param {Point} position
 */
export function handleUserActionMoveTo(userId, position) {
  const nextPosition = new Point(position.x, position.y);
  const characterModel = gameState.findCharacterByUserId(userId);
  const characterPosition = characterModel.get('position');
  const movement = characterModel.get('movement');

  // check if place Character is moving to is too far away
  const tileDistance = matrixUtils.getDistanceBetween(gameState.get('matrix'), characterPosition, nextPosition);
  if (tileDistance > movement) {
    return;
  }

  // check if destination is actually walkable
  if (!gameState.isWalkableAt(nextPosition)) {
    return;
  }

  // finally update the character's position
  characterModel.set({
    position: nextPosition,
    movement: movement - tileDistance,
  });
}
/**
 * a User's Action (and therefore a User's turn) was finished
 *
 * @param {String} userId
 */
export function onUserActionComplete(userId) {
  const userModel = gameState.findUserById(userId);

  userModel.set({
    isUserTurn: false,
  });

  // next turn
  gameState.handleEndOfTurn();
}
