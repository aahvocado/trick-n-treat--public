import {GAME_MODES} from 'constants.shared/gameModes';

import gameState from 'state/gameState';

import logger from 'utilities/logger.game';

/**
 * EXPERIMENTAL
 * this Helper should try to manage the `actionQueue`
 *
 * @typedef {Function} ActionFunction
 */

// number of actions ever created
let actionCount = 0;
// ms to wait between each resolving action
const timeBetweenActions = 150;

/**
 * creates an asynchronous Action for the ActionQueue using given function
 *  the function this returns is not async,
 *  but when called it will execute an async function
 *
 * @param {Function} baseFunction
 * @returns {Function}
 */
export function createActionFunction(baseFunction) {
  if (typeof baseFunction !== 'function') {
    logger.error('createActionFunction() was not given a function');
    return;
  }

  const choiceId = actionCount;
  actionCount += 1;
  logger.verbose(`. [[adding baseFunction #${choiceId}]]`);

  return () => {
    return new Promise((resolve) => {
      logger.verbose(`. [[resolving action #${choiceId}]]`);

      // actually call the function here
      baseFunction();

      // pause between actions
      setTimeout(resolve, timeBetweenActions);
    });
  };
}
/**
 * add action to the end of queue
 *
 * @param {Function} baseFunction
 */
export function addToActionQueue(baseFunction) {
  const actionFunction = createActionFunction(baseFunction);
  gameState.addToArray('actionQueue', actionFunction);

  // check if we can start resolving
  if (shouldResolveActionQueue()) {
    logger.new('[[resolving ActionQueue from the top]]');
    resolveActionQueue();
  }
}
/**
 * insert an Action into the front of the Queue
 *
 * @param {Function} baseFunction
 * @param {Number} [idx]
 */
export function insertIntoActionQueue(baseFunction, idx = 0) {
  const actionFunction = createActionFunction(baseFunction);

  // splice `actionFunction` into given idx in the queue
  const actionQueue = gameState.get('actionQueue').slice();
  actionQueue.splice(idx, 0, actionFunction);
  gameState.set({actionQueue: actionQueue});

  // check if we can start resolving
  if (shouldResolveActionQueue()) {
    logger.new('[[resolving ActionQueue from the top]]');
    resolveActionQueue();
  }
}
/**
 * go through the `actionQueue` and resolve each `ActionFunction`
 */
export async function resolveActionQueue() {
  const actionQueue = gameState.get('actionQueue').slice();
  const activeAction = actionQueue.shift();

  // update state to indicate we are resolving actions
  // - `activeAction` is updated
  // - update queue
  gameState.set({
    mode: GAME_MODES.WORKING,
    activeAction: activeAction,
    actionQueue: actionQueue,
  });

  await activeAction();

  // resolve the next action, since previous actions may have added more
  if (gameState.get('actionQueue').length > 0) {
    resolveActionQueue();
    return;
  }

  // update state to indicate we are done
  logger.old('[[finished resolving ActionQueue]]');
  gameState.set({
    mode: GAME_MODES.ACTIVE,
    activeAction: null,
  });
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
/**
 * determines if we can start the resolution of the `actionQueue`
 *
 * @returns {Boolean}
 */
export function shouldResolveActionQueue() {
  const actionQueue = gameState.get('actionQueue').slice();

  // can not start if queue is empty
  if (actionQueue.length <= 0) {
    return false;
  }

  // can not start resolution if there already is an `activeAction`
  if (gameState.get('activeAction') !== null) {
    return false;
  }

  // go for it
  return true;
}
