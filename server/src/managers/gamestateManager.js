import seedrandom from 'seedrandom';

import {CLIENT_ACTIONS} from 'constants/clientActions';
import {GAME_MODES} from 'constants/gameModes';

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
 */
serverStateManager.onChange('mode', (newMode) => {
  gamestate.set({mode: GAME_MODES.WORKING});

  // if not in Game Mode, do nothing
  if (newMode !== 'GAME-MODE') {
    gamestate.set({mode: GAME_MODES.INACTIVE});
    return;
  }

  // initialize
  init();
  gamestate.set({mode: GAME_MODES.ACTIVE});

  console.log('\x1b[36m', 'Game Started!', `(Seed "${seed}")`);
  gamestate.displayTurnQueue();
});
/**
 *
 */
function init() {
  // create the map instance
  const baseTileMapModel = gamestateUtils.createBaseTileMapModel();
  const encounterList = gamestateUtils.createEncounterList(baseTileMapModel);
  const fogMapModel = gamestateUtils.createFogOfWarModel(baseTileMapModel);

  gamestate.set({
    tileMapModel: baseTileMapModel,
    encounters: encounterList,
    fogMapModel: fogMapModel,
  });

  // create `users` based on connected Clients
  const serverStateObj = serverStateManager.getState();
  gamestate.createUsersFromClients(serverStateObj.clients);

  // create `turnQueue` based on `users`
  gamestate.initTurnQueue();
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

  if (actionId === CLIENT_ACTIONS.MOVE.LEFT) {
    gamestate.updateCharacterPosition(userId, 'left');
  }

  if (actionId === CLIENT_ACTIONS.MOVE.RIGHT) {
    gamestate.updateCharacterPosition(userId, 'right');
  }

  if (actionId === CLIENT_ACTIONS.MOVE.UP) {
    gamestate.updateCharacterPosition(userId, 'up');
  }

  if (actionId === CLIENT_ACTIONS.MOVE.DOWN) {
    gamestate.updateCharacterPosition(userId, 'down');
  }

  gamestate.handleNextTurn();
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
