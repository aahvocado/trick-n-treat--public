import seedrandom from 'seedrandom';

import {CLIENT_ACTIONS, isMovementAction} from 'constants/clientActions';
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
  // if not in Game Mode, do nothing
  if (newMode !== 'GAME-MODE') {
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
  gamestate.createUsersFromClients(serverStateObj.clients);

  // start the first round, which will create a turn queue
  gamestate.handleEndOfRound();

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
