import {GAME_MODES} from 'constants/gameModes';

import gameState from 'data/gameState';

import {sendUpdateToAllClients} from 'managers/clientManager';

import logger from 'utilities/logger';

/**
 * this Helper should try to manage the `actionQueue`
 *
 * @typedef {Function} ActionFunction
 */

/**
 *
 */
export async function resolveActionQueue() {
  const actionQueue = gameState.get('actionQueue').slice();
  if (actionQueue.length <= 0) {
    return;
  }

  const activeAction = actionQueue.shift();
  gameState.set({
    mode: GAME_MODES.WORKING,
    activeAction: activeAction,
    actionQueue: actionQueue,
  });

  await activeAction();
  gameState.set({activeAction: null});

  // see if there are more actions to resolve, since previous may have added more
  if (gameState.get('actionQueue').length > 0) {
    resolveActionQueue();
    return;
  }

  gameState.set({mode: GAME_MODES.ACTIVE});
  sendUpdateToAllClients();
  logger.old('[[finished resolving ActionQueue]]');
}
/**
 * immediately clear everything from the `actionQueue`
 */
export function clearActionQueue() {
  const actionQueue = gameState.get('actionQueue').slice();
  if (actionQueue.length <= 0) {
    return;
  }

  gameState.set({actionQueue: []});
  logger.old('[[cleared ActionQueue]]');
}
