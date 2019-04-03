import {GAME_MODES} from 'constants/gameModes';

import remoteAppState from 'data/remoteAppState';

/**
 *
 * @returns {Boolean}
 */
export function isMyTurn() {
  const myUser = remoteAppState.get('myUser');
  return myUser.isUserTurn;
}
/**
 * all encompassing function that determines if this User is allowed to take an Action
 *
 * @returns {Boolean}
 */
export function canUseActions() {
  const gamestate = remoteAppState.get('gamestate');
  if (gamestate === undefined) {
    return false;
  }

  const isGameBusy = gamestate.mode !== GAME_MODES.ACTIVE;
  if (isGameBusy) {
    return false;
  };

  if (!isMyTurn()) {
    return false;
  };

  return true;
}
