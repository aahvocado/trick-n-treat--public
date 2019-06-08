import {MAP_WIDTH, MAP_HEIGHT} from 'constants/mapSettings';

import {GAME_MODES} from 'constants.shared/gameModes';
import {TILE_TYPES} from 'constants.shared/tileTypes';

import gameState from 'state/gameState';

import * as clientEventHelper from 'helpers/clientEventHelper';
import * as gamestateGenerationHelper from 'helpers/gamestateGenerationHelper';

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
  logger.game('Resetting GameState...');

  // reset generic attributes
  gameState.import({
    actionQueue: [],
    activeAction: null,
    turnQueue: [],
    round: 0,
    lightSourceList: [],
  });

  // reset ModelList
  gameState.get('characterList').import([]);
  gameState.get('encounterList').import([]);
  gameState.get('biomeList').import([]);

  // reset Maps
  gameState.get('tileMapModel').resetMatrix(MAP_WIDTH, MAP_HEIGHT, TILE_TYPES.EMPTY);
  gameState.get('lightMapModel').resetMatrix(MAP_WIDTH, MAP_HEIGHT, 0);

  // reset Instances
  gameState.resetEncounterHelper();
}
/**
 * set up the start of a new game
 *
 * @param {Array<ClientModel>} clientList
 */
export function handleStartGame(clientList) {
  logger.lifecycle('handleStartGame()');

  // first clean everything up
  gameState.set({mode: GAME_MODES.WORKING});
  resetState();

  // create Characters for each Client that is part of the game
  clientList.forEach((clientModel) => {
    const newCharacterModel = gameState.createCharacterForClient(clientModel);
    gameState.get('characterList').push(newCharacterModel);
  });

  // immediately update clients so they know they are in game
  gameState.insertIntoActionQueue(() => {
    clientEventHelper.sendLobbyUpdate();
  });

  // proceed to generate map
  gameState.addToActionQueue(() => {
    gamestateGenerationHelper.generateNewMap();
  });

  // after map is generated, update the world the first time
  gameState.addToActionQueue(() => {
    updateEncounters();
    updateLighting();
  });

  // after map is generated, update the clients
  gameState.addToActionQueue(() => {
    clientEventHelper.sendLobbyUpdate();
  });

  // start the round after all that
  gameState.addToActionQueue(() => {
    gameState.set({mode: GAME_MODES.ACTIVE});
    gameState.handleStartOfRound();
  });
}
/**
 * end current game
 */
export function handleEndGame() {
  logger.lifecycle('handleEndGame()');

  // clear some states
  gameState.set({
    mode: GAME_MODES.INACTIVE,
    activeAction: null,
    activeEncounter: null,
  });

  // immediately update clients so the game is ended
  gameState.insertIntoActionQueue(() => {
    clientEventHelper.sendGameEnd();
  });
}
/**
 * restart game
 *
 * @param {Array<ClientModel>} clientList
 */
export function handleRestartGame(clientList) {
  logger.lifecycle('handleRestartGame()');

  // end the game
  gameState.addToActionQueue(() => {
    gameState.handleEndGame();
  });

  // start the game
  gameState.addToActionQueue(() => {
    gameState.handleStartGame(clientList);
  });
}
// -- Character
/**
 * handles things that need to be done before Character does an Action
 *
 * @param {CharacterModel} characterModel
 */
export function handleStartOfAction(characterModel) {
  logger.lifecycle('handleStartOfAction()');

  // update
  clientEventHelper.sendGameUpdate();
}
/**
 * handles what happens after a Character does an Action
 *
 * @param {CharacterModel} characterModel
 */
export function handleEndOfAction(characterModel) {
  logger.lifecycle('handleEndOfAction()');

  // not an end of Action if we are waiting on an `activeEncounter`
  if (gameState.get('activeEncounter') !== null) {
    logger.warning('. Lifecycle can not "handleEndOfAction()" when there is an `activeEncounter`.');
    return;
  }

  // if Character can no longer move, it's time to end their turn
  if (!characterModel.canMove()) {
    gameState.addToActionQueue(() => {
      gameState.handleEndOfTurn();
    });
    return;
  }

  // immediately update clients otherwise
  gameState.insertIntoActionQueue(() => {
    clientEventHelper.sendGameUpdate();
  });
}
// -- Turn
/**
 * handles start of turn
 */
export function handleStartOfTurn() {
  logger.lifecycle('handleStartOfTurn()');

  // `activeCharacter` is the first character in the queue
  const turnQueue = gameState.get('turnQueue').slice();
  const newActiveCharacter = turnQueue[0];
  newActiveCharacter.set({
    isActiveCharacter: true,
  });

  // update client
  logger.game(`. Turn for: "${newActiveCharacter.get('name')}"`);
  clientEventHelper.sendGameUpdate();
}
/**
 * end of turn
 */
export function handleEndOfTurn() {
  logger.lifecycle('handleEndOfTurn()');

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

  // update world
  updateEncounters();
  updateLighting();

  // immediately send a Game Update
  clientEventHelper.sendGameUpdate();

  // start the next turn if there is more in the `turnQueue`
  if (currentTurnQueue.length > 0) {
    gameState.addToActionQueue(() => {
      gameState.handleStartOfTurn();
    });
    return;
  }

  // end the round if nothing left in the `turnQueue`
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
  logger.lifecycle('handleStartOfRound()');

  // increment round
  gameState.set({round: gameState.get('round') + 1});
  logger.game(`Round ${gameState.get('round')} has started.`);

  // immediately send a Game Update
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
  logger.lifecycle('handleEndOfRound()');

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
  logger.lifecycle('initTurnQueue()');
  const characterList = gameState.get('characterList').slice();
  if (characterList.length <= 0) {
    logger.error('Why are we creating a `turnQueue` with no Characters?');
    return;
  }

  const newTurnQueue = randomizeArray(characterList);
  gameState.set({turnQueue: newTurnQueue});

  // now that turn queue is created, start the round
  gameState.insertIntoActionQueue(() => {
    gameState.handleStartOfTurn();
  });
}
// -- world update
/**
 * looks through Encounters to see if any of them needs updates
 */
export function updateEncounters() {
  logger.lifecycle('. updateEncounters()');

  const encounterList = gameState.get('encounterList');
  const filteredList = encounterList.filter((encounterModel) => !encounterModel.get('isMarkedForDeletion'));
  encounterList.replace(filteredList);
}
/**
 * rebuilds all the lightLevels
 */
export function updateLighting() {
  logger.lifecycle('. updateLighting()');

  // reset the light map first
  gameState.get('lightMapModel').resetMatrix();

  // then rebuild the light sources
  const lightSourceList = gamestateGenerationHelper.generateLightSourceList();

  // light up those Light Sources
  lightSourceList.forEach((lightPoint) => {
    gameState.updateLightLevelsAt(lightPoint, 5, {shouldOverride: true});
  });

  // light up Characters
  const characterList = gameState.get('characterList');
  characterList.forEach((characterModel) => {
    const location = characterModel.get('position');
    const vision = characterModel.get('vision');
    gameState.updateLightLevelsAt(location, vision);
  });
}
