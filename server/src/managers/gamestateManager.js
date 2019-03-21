import seedrandom from 'seedrandom';
import Point from '@studiomoniker/point';

import {CLIENT_ACTIONS, isMovementAction} from 'constants/clientActions';
import {GAME_MODES, SERVER_MODES} from 'constants/gameModes';

import * as serverStateManager from 'managers/serverStateManager';

import GamestateModel from 'models/GamestateModel';

import * as gamestateUtils from 'utilities/gamestateUtils';

// seed it
const seed = Date.now();
seedrandom(seed, {global: true});
/** @type {GamestateModel} */
const gamestate = new GamestateModel();
/**
 * listen to when the Server switches to Game Mode
 * TODO: this feels a bit fragile
 */
serverStateManager.onChange('mode', (newMode) => {
  // if not in Game Mode, do nothing
  if (newMode !== SERVER_MODES.GAME) {
    gamestate.set({mode: GAME_MODES.INACTIVE});
    return;
  }

  // initialize
  console.log('\x1b[36m', 'Game Starting!', `(Seed "${seed}")`);
  init();
});
/**
 *
 */
function init() {
  gamestate.set({mode: GAME_MODES.WORKING});

  // create the map instance
  const baseTileMapModel = gamestateUtils.createBaseTileMapModel();
  const houseList = gamestateUtils.createHouseList(baseTileMapModel);
  const encounterList = gamestateUtils.createEncounterList(baseTileMapModel);
  const fogMapModel = gamestateUtils.createFogOfWarModel(baseTileMapModel);

  gamestate.set({
    tileMapModel: baseTileMapModel,
    houses: houseList,
    encounters: encounterList,
    fogMapModel: fogMapModel,
  });

  // create `users` based on connected Clients
  const serverStateObj = serverStateManager.getState();
  serverStateObj.clients.forEach((client) => {
    gamestate.createUserFromClient(client);
  });

  // start the first round, which will create a turn queue
  gamestate.handleStartOfRound();

  // update visibility
  const activeCharacter = gamestate.get('activeCharacter');
  gamestate.updateToVisibleAt(activeCharacter.get('position'), activeCharacter.get('vision'));

  gamestate.set({mode: GAME_MODES.ACTIVE});
}
/**
 * User did something
 *
 * @param {String} userId
 * @param {String} actionId
 */
export function handleUserGameAction(userId, actionId) {
  // check if it is the Turn of the user who clicked
  const activeUser = gamestate.get('activeUser');
  if (activeUser.get('userId') !== userId) {
    return;
  }

  // handle movement actions
  if (isMovementAction(actionId)) {
    gamestate.handleUserActionMove(userId, actionId);
    return;
  }

  //
  if (actionId === CLIENT_ACTIONS.TRICK) {
    gamestate.handleUserActionTrick(userId);
  }
  if (actionId === CLIENT_ACTIONS.TREAT) {
    gamestate.handleUserActionTreat(userId);
  }
}
/**
 * User wants to move to a place
 *
 * @param {String} userId
 * @param {Point} position
 */
export function handleUserActionMoveTo(userId, position) {
  gamestate.handleUserActionMoveTo(userId, new Point(position.x, position.y));
}
/**
 * @param {String} property
 * @returns {*}
 */
export function get(property) {
  return gamestate.get(property);
}
/**
 * @param {String} property - one of the observeable properties in the `appStore`
 * @param {Function} callback
 * @returns {Function} - disposer to remove listener
 */
export function onChange(property, callback) {
  return gamestate.onChange(property, callback);
}
/**
 * @returns {Object}
 */
export function exportState() {
  return gamestate.export();
}
/**
 * @param {String} userId
 * @returns {Object}
 */
export function getClientUserAndCharacter(userId) {
  const characterModel = gamestate.findCharacterByUserId(userId);
  const userModel = gamestate.findUserById(userId);

  if (characterModel === undefined || userModel === undefined) {
    return;
  }

  return {
    myCharacter: characterModel.export(),
    myUser: userModel.export(),
  };
}
/**
 * Client is joining a game in session
 *
 * @param {SocketClientModel} socketClient
 */
export function handleJoinGame(socketClient) {
  // can't join an inactive game
  if (gamestate.get('mode') === GAME_MODES.INACTIVE) {
    return;
  }

  socketClient.set({
    isInLobby: false,
    isInGame: true,
  });

  gamestate.createUserFromClient(socketClient);
}
