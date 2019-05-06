import {GAME_MODES} from 'constants.shared/gameModes';

import remoteAppState from 'state/remoteAppState';
import remoteGameState from 'state/remoteGameState';

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
  const gamestate = remoteGameState.get('gamestate');
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
