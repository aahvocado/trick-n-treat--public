import {MAP_WIDTH, MAP_HEIGHT} from 'constants/mapSettings';

import {GAME_MODE} from 'constants.shared/gameModes';
import {TILE_TYPES} from 'constants.shared/tileTypes';

import gameState from 'state/gameState';
import serverState from 'state/serverState';

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
  gameState.set({mode: GAME_MODE.WORKING});
  resetState();

  // create Characters for each Client that is part of the game
  clientList.forEach((clientModel) => {
    const newCharacterModel = gameState.createCharacterForClient(clientModel);
    gameState.get('characterList').push(newCharacterModel);
  });

  // immediately update clientList so they know they are in game
  gameState.insertIntoFunctionQueue(() => {
    serverState.emitLobbyUpdate();
  }, 'emitLobbyUpdate');

  // proceed to generate map
  gameState.addToFunctionQueue(() => {
    gamestateGenerationHelper.generateNewMap();
  }, 'generateNewMap');

  // after map is generated, update the world the first time
  gameState.addToFunctionQueue(() => {
    updateEncounters();
    updateLighting();
  }, 'updateWorld');

  // after map is generated, update the clientList
  gameState.addToFunctionQueue(() => {
    serverState.emitLobbyUpdate();
  }, 'emitLobbyUpdate');

  // start the round after all that
  gameState.addToFunctionQueue(() => {
    gameState.set({mode: GAME_MODE.READY});
    gameState.handleStartOfRound();
  }, 'handleStartOfRound');
}
/**
 * end current game
 */
export function handleEndGame() {
  logger.lifecycle('handleEndGame()');

  // clear some states
  gameState.set({
    mode: GAME_MODE.INACTIVE,
    activeEncounter: null,
  });

  // immediately tell all gameClients that the game has ended
  gameState.insertIntoFunctionQueue(() => {
    serverState.get('gameClients').forEach((client) => client.emitGameEnd());
  }, 'emitGameEnd');
}
/**
 * restart game
 *
 * @param {Array<ClientModel>} clientList
 */
export function handleRestartGame(clientList) {
  logger.lifecycle('handleRestartGame()');

  // end the game
  gameState.addToFunctionQueue(() => {
    gameState.handleEndGame();
  }, 'handleEndGame');

  // start the game
  gameState.addToFunctionQueue(() => {
    gameState.handleStartGame(clientList);
  }, 'handleStartGame');
}
// -- Character
/**
 * handles things that need to be done before Character does an Action
 *
 * @param {CharacterModel} characterModel
 */
export function handleStartOfAction(characterModel) {
  logger.lifecycle('handleStartOfAction()');

  // set mode to working
  gameState.set({mode: GAME_MODE.WORKING});

  // update
  // serverState.emitGameUpdate();
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
    gameState.addToFunctionQueue(() => {
      gameState.handleEndOfTurn();
    }, 'handleEndOfTurn');
    return;
  }

  // game is ready
  gameState.set({mode: GAME_MODE.READY});

  // immediately update clientList otherwise
  gameState.insertIntoFunctionQueue(() => {
    serverState.emitGameUpdate();
  }, 'emitGameUpdate');
}
// -- Turn
/**
 * handles start of turn
 */
export function handleStartOfTurn() {
  logger.lifecycle('handleStartOfTurn()');

  // game is ready
  gameState.set({mode: GAME_MODE.READY});

  // `currentCharacter` will be the first character from the `turnQueue`
  const turnQueue = gameState.get('turnQueue').slice();
  const newActiveCharacter = turnQueue[0];
  newActiveCharacter.set({
    isActive: true,
  });

  // update client
  logger.game(`. Turn for: "${newActiveCharacter.get('name')}"`);
  serverState.emitGameUpdate();
}
/**
 * end of turn
 */
export function handleEndOfTurn() {
  logger.lifecycle('handleEndOfTurn()');

  // remove the previous `currentCharacter`
  const currentTurnQueue = gameState.get('turnQueue').slice();
  const previousCharacter = currentTurnQueue.shift();

  // set the new `turnQueue`
  gameState.set({turnQueue: currentTurnQueue});

  // clean up the previously active character,
  // - they are longer active
  // - reset their movement
  previousCharacter.set({
    isActive: false,
    movement: previousCharacter.get('movementBase'),
  });

  // update world
  updateEncounters();
  // updateLighting();

  // immediately send a Game Update
  serverState.emitGameUpdate();

  // start the next turn if there is more in the `turnQueue`
  if (currentTurnQueue.length > 0) {
    gameState.addToFunctionQueue(() => {
      gameState.handleStartOfTurn();
    }, 'handleStartOfTurn');
    return;
  }

  // end the round if nothing left in the `turnQueue`
  if (currentTurnQueue.length <= 0) {
    gameState.addToFunctionQueue(() => {
      gameState.handleEndOfRound();
    }, 'handleEndOfRound');
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
  serverState.emitGameUpdate();

  // create new turn queue
  gameState.addToFunctionQueue(() => {
    gameState.initTurnQueue();
  }, 'initTurnQueue');
}
/**
 * end round
 */
export function handleEndOfRound() {
  logger.lifecycle('handleEndOfRound()');

  // update
  serverState.emitGameUpdate();

  // go to next round
  gameState.addToFunctionQueue(() => {
    gameState.handleStartOfRound();
  }, 'handleStartOfRound');
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
  gameState.insertIntoFunctionQueue(() => {
    gameState.handleStartOfTurn();
  }, 'handleStartOfTurn');
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
    gameState.updateLightLevelsAt(lightPoint, 6, {shouldOverride: true});
  });

  // light up Characters
  const characterList = gameState.get('characterList');
  characterList.forEach((characterModel) => {
    const location = characterModel.get('position');
    const vision = characterModel.get('vision');
    gameState.updateLightLevelsAt(location, vision);
  });
}
