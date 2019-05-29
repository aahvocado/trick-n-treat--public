import {GAME_MODES} from 'constants.shared/gameModes';

import MapModel from 'models.shared/MapModel';

import gameState from 'state/gameState';

import * as clientEventHelper from 'helpers/clientEventHelper';
import * as gamestateMapHelper from 'helpers/gamestateMapHelper';

import logger from 'utilities/logger.game';

import randomizeArray from 'utilities.shared/randomizeArray';

/**
 * here's how it looks right now
 *
 * 1. handleStartGame()
 * 2. handleStartOfRound()
 * 3. initTurnQueue()
 * 4. handleStartOfTurn()
 * 5. handleStartOfAction()
 * 6. handleEndOfAction()
 * (repeat steps 5 and 6 until User finishes)
 * 7. handleEndOfTurn()
 * (repeat steps 4, 5, 6, 7 until all Characters complete their turn)
 * 8. handleEndOfRound()
 * 9. handleEndGame()
 */

/**
 * clears the gamestate data to default
 *
 * @todo - reset Characters
 */
export function resetState() {
  logger.lifecycle('(resetState())');

  gameState.set({
    actionQueue: [],
    activeAction: null,
    turnQueue: [],
    round: 0,
    encounters: [],
    biomeList: [],
    tileMapModel: new MapModel(),
    fogMapModel: new MapModel(),
  });
}
/**
 * set up the start of a new game
 *
 * @param {Array<ClientModel>} clientList
 */
export function handleStartGame(clientList) {
  logger.lifecycle('(handleStartGame())');

  // first clean everything up
  gameState.set({mode: GAME_MODES.WORKING});
  resetState();

  // create Characters for each Client that is part of the game
  clientList.forEach((clientModel) => {
    const newCharacterModel = gameState.createCharacterForClient(clientModel);
    gameState.addToArray('characters', newCharacterModel);
  });

  // update
  clientEventHelper.sendLobbyUpdate();

  // then proceed to generate map
  gameState.addToActionQueue(() => {
    gamestateMapHelper.generateNewMap();
  });
}
/**
 * end current game
 */
export function handleEndGame() {
  logger.lifecycle('(handleEndGame())');

  gameState.set({
    mode: GAME_MODES.INACTIVE,
    activeAction: null,
    activeEncounter: null,
  });

  clientEventHelper.sendGameEnd();
}
/**
 * restart game
 *
 * @param {Array<ClientModel>} clientList
 */
export function handleRestartGame(clientList) {
  logger.lifecycle('(handleRestartGame())');

  gameState.addToActionQueue(handleEndGame);
  gameState.addToActionQueue(() => {
    handleStartGame(clientList);
  });
}
// -- Character
/**
 * handles things that need to be done before Character does an Action
 *
 * @param {CharacterModel} characterModel
 */
export function handleStartOfAction(characterModel) {
  logger.lifecycle('(handleStartOfAction())');

  // update
  clientEventHelper.sendGameUpdate();
}
/**
 * handles what happens after a Character does an Action
 *
 * @param {CharacterModel} characterModel
 */
export function handleEndOfAction(characterModel) {
  logger.lifecycle('(handleEndOfAction())');

  // not an end of Action if we are waiting on an `activeEncounter`
  if (gameState.get('activeEncounter') !== null) {
    logger.warning('. Can handle end of action when there is an `activeEncounter`.');
    return;
  }

  // update
  clientEventHelper.sendGameUpdate();

  // if Character can no longer move, it's time to end their turn
  if (!characterModel.canMove()) {
    // end their turn
    gameState.addToActionQueue(() => {
      gameState.handleEndOfTurn();
    });
  }
}
// -- Turn
/**
 * handles start of turn
 */
export function handleStartOfTurn() {
  logger.lifecycle('(handleStartOfTurn())');

  // `activeCharacter` is the first character in the queue
  const turnQueue = gameState.get('turnQueue').slice();
  const newActiveCharacter = turnQueue[0];
  newActiveCharacter.set({
    isActiveCharacter: true,
  });

  // update
  logger.game(`. Turn for: "${newActiveCharacter.get('name')}"`);
  clientEventHelper.sendGameUpdate();
}
/**
 * end of turn
 */
export function handleEndOfTurn() {
  logger.lifecycle('(handleEndOfTurn())');

  // remove the previous `activeCharacter`
  const currentTurnQueue = gameState.get('turnQueue').slice();
  const oldActiveCharacter = currentTurnQueue.shift();

  // set the new `turnQueue`
  gameState.set({turnQueue: currentTurnQueue});

  // clean up the previous `activeCharacter`,
  // - they are longer active
  // - reset their movement
  oldActiveCharacter.set({
    isActiveCharacter: false,
    movement: oldActiveCharacter.get('baseMovement'),
  });

  // update
  clientEventHelper.sendGameUpdate();

  // start the next turn if there is more in the `turnQueue`
  if (currentTurnQueue.length > 0) {
    gameState.addToActionQueue(() => {
      gameState.handleStartOfTurn();
    });
    return;
  }

  // end the round if nothing left in the turn queue
  if (currentTurnQueue.length <= 0) {
    gameState.addToActionQueue(() => {
      gameState.handleEndOfRound();
    });
    return;
  }
}
// -- Round
/**
 * start round
 */
export function handleStartOfRound() {
  logger.lifecycle('(handleStartOfRound())');

  // increment round
  gameState.set({round: gameState.get('round') + 1});
  logger.game(`Round ${gameState.get('round')} has started.`);

  // update
  clientEventHelper.sendGameUpdate();

  // create new turn queue
  gameState.addToActionQueue(() => {
    gameState.initTurnQueue();
  });
}
/**
 * end round
 */
export function handleEndOfRound() {
  logger.lifecycle('(handleEndOfRound())');

  // update
  clientEventHelper.sendGameUpdate();

  // go to next round
  gameState.addToActionQueue(() => {
    gameState.handleStartOfRound();
  });
}
/**
 * builds a Turn Queue based on stuff
 */
export function initTurnQueue() {
  logger.lifecycle('(initTurnQueue())');
  const characters = gameState.get('characters').slice();
  if (characters.length <= 0) {
    logger.error('Why are we creating a `turnQueue` with no Characters?');
    return;
  }

  const newTurnQueue = randomizeArray(characters);
  gameState.set({turnQueue: newTurnQueue});

  // now that turn queue is created, start the round
  gameState.addToActionQueue(() => {
    gameState.handleStartOfTurn();
  });
}
