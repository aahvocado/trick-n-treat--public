import {extendObservable} from 'mobx';
import seedrandom from 'seedrandom';

import {GAME_MODE} from 'constants.shared/gameModes';

import * as gamestateCharacterHelper from 'helpers/gamestateCharacterHelper';
import * as gamestateDataHelper from 'helpers/gamestateDataHelper';
import * as gamestateEncounterHelper from 'helpers/gamestateEncounterHelper';
import * as gamestateFunctionQueueHelper from 'helpers/gamestateFunctionQueueHelper';
import * as gamestateLifecycleHelper from 'helpers/gamestateLifecycleHelper';
import * as gamestateMapHelper from 'helpers/gamestateMapHelper';

import CharacterModel from 'models.shared/CharacterModel';
import EncounterModel from 'models.shared/EncounterModel';
import GridModel from 'models.shared/GridModel';
import Model from 'models.shared/Model';
import ModelList from 'models.shared/ModelList';

import logger from 'utilities/logger.game';

// seed for rng
const seed = Date.now();
seedrandom(seed, {global: true});
/**
 * Gamestate Model is a singleton that handles everything in the game
 */
export class GamestateModel extends Model {
  /** @override */
  constructor(newAttributes = {}) {
    super({
      // -- State attributes
      /** @type {GameMode} */
      mode: GAME_MODE.INACTIVE,
      /** @type {Array<CharacterModel>} */
      turnQueue: [],
      /** @type {EncounterModel | null} */
      activeEncounter: null,
      /** @type {Number} */
      round: 0,

      // -- Entity attributes
      /** @type {ModelList<CharacterModel>} */
      characterList: new ModelList([], CharacterModel),
      /** @type {ModelList<EncounterModel>} */
      encounterList: new ModelList([], EncounterModel),
      /** @type {GridModel} */
      mapGridModel: new GridModel(),
      /** @type {GridModel} */
      lightingModel: new GridModel(),

      // -- Instance attributes
      /** @type {ModelList<GridModel>} */
      biomeList: new ModelList([], GridModel),
      /** @type {Array<Point>} */
      lightSourceList: [],

      /** @type {String} */
      seed: seed,
      /** @type {Object} */
      ...newAttributes,
    });

    // computed attributes - (have to pass in `this` as context because getters have their own context)
    const _this = this;
    extendObservable(this.attributes, {
      /** @type {Boolean} */
      get isActive() {
        return _this.get('mode') !== GAME_MODE.INACTIVE && _this.get('mode') !== GAME_MODE.PAUSED;
      },
      /** @type {Boolean} */
      get isReady() {
        return _this.get('isActive') && !_this.get('isWorking');
      },
      /** @type {Boolean} */
      get isWorking() {
        return _this.get('mode') === GAME_MODE.WORKING;
      },
      /** @type {CharacterModel | null} */
      get currentCharacter() {
        return _this.getCurrentCharacter();
      },
      /** @type {Array<EncounterModel>} */
      get visibleEncounterList() {
        return _this.getVisibleEncounterList();
      },
    });

    logger.lifecycle(`Gamestate instantiated - (Seed "${seed}")`);
  }
  // -- Game Lifecycle methods - gamestateLifecycleHelper.js
  /** @override */
  resetState() {
    gamestateLifecycleHelper.resetState();
  }
  /** @override */
  initTurnQueue() {
    gamestateLifecycleHelper.initTurnQueue();
  }
  /** @override */
  handleStartGame(clientList) {
    gamestateLifecycleHelper.handleStartGame(clientList);
  }
  /** @override */
  handleEndGame() {
    gamestateLifecycleHelper.handleEndGame();
  }
  /** @override */
  handleRestartGame(clientList) {
    gamestateLifecycleHelper.handleRestartGame(clientList);
  }
  /** @override */
  handleStartOfTurn() {
    gamestateLifecycleHelper.handleStartOfTurn();
  }
  /** @override */
  handleEndOfTurn() {
    gamestateLifecycleHelper.handleEndOfTurn();
  }
  /** @override */
  handleStartOfAction(characterModel) {
    gamestateLifecycleHelper.handleStartOfAction(characterModel);
  }
  /** @override */
  handleEndOfAction(characterModel) {
    gamestateLifecycleHelper.handleEndOfAction(characterModel);
  }
  /** @override */
  handleStartOfRound() {
    gamestateLifecycleHelper.handleStartOfRound();
  }
  /** @override */
  handleEndOfRound() {
    gamestateLifecycleHelper.handleEndOfRound();
  }
  /** @override */
  updateEncounters() {
    gamestateLifecycleHelper.updateEncounters();
  }
  /** @override */
  removeMarkedEncounters() {
    gamestateLifecycleHelper.removeMarkedEncounters();
  }
  /** @override */
  updateLighting() {
    gamestateLifecycleHelper.updateLighting();
  }
  // -- Character methods - gamestateCharacterHelper.js
  /** @override */
  createCharacterForClient(clientModel) {
    return gamestateCharacterHelper.createCharacterForClient(clientModel);
  }
  /** @override */
  handleClientRejoin(clientModel) {
    gamestateCharacterHelper.handleClientRejoin(clientModel);
  }
  /** @override */
  getCurrentCharacter() {
    return gamestateCharacterHelper.getCurrentCharacter();
  }
  /** @override */
  getCharactersAt(point) {
    return gamestateCharacterHelper.getCharactersAt(point);
  }
  /** @override */
  findCharacterById(characterId) {
    return gamestateCharacterHelper.findCharacterById(characterId);
  }
  /** @override */
  findCharacterByClientId(clientId) {
    return gamestateCharacterHelper.findCharacterByClientId(clientId);
  }
  /** @override */
  updateCharacterPosition(characterModel, position) {
    gamestateCharacterHelper.updateCharacterPosition(characterModel, position);
  }
  /** @override */
  moveCharacterTo(characterModel, position) {
    gamestateCharacterHelper.moveCharacterTo(characterModel, position);
  }
  /** @override */
  handleCharacterUseItem(characterModel, itemModel) {
    gamestateCharacterHelper.handleCharacterUseItem(characterModel, itemModel);
  }
  /** @override */
  handleCharacterEndTurn(characterModel) {
    gamestateCharacterHelper.handleCharacterEndTurn(characterModel);
  }
  /** @override */
  handleCharacterExamineEncounter(characterModel) {
    gamestateCharacterHelper.handleCharacterExamineEncounter(characterModel);
  }
  /** @override */
  handleCharacterChoseAction(characterModel, encounterId, actionData) {
    gamestateCharacterHelper.handleCharacterChoseAction(characterModel, encounterId, actionData);
  }
  /** @override */
  onFinishEncounter(characterModel, encounterModel, actionData) {
    gamestateCharacterHelper.onFinishEncounter(characterModel, encounterModel, actionData);
  }
  /** @override */
  handleCharacterTriggerEncounter(characterModel, encounterModel) {
    gamestateCharacterHelper.handleCharacterTriggerEncounter(characterModel, encounterModel);
  }
  /** @override */
  handleChoiceGoTo(characterModel, encounterModel) {
    gamestateCharacterHelper.handleChoiceGoTo(characterModel, encounterModel);
  }
  /** @override */
  handleChoiceTrick(characterModel, encounterModel) {
    gamestateCharacterHelper.handleChoiceTrick(characterModel, encounterModel);
  }
  /** @override */
  handleChoiceTreat(characterModel, encounterModel) {
    gamestateCharacterHelper.handleChoiceTreat(characterModel, encounterModel);
  }
  // -- Map methods - gamestateMapHelper.js
  /** @override */
  isWalkableAt(point) {
    return gamestateMapHelper.isWalkableAt(point);
  }
  /** @override */
  isWallAt(point) {
    return gamestateMapHelper.isWallAt(point);
  }
  /** @override */
  isNearEncounterAt(startPoint, distance) {
    return gamestateMapHelper.isNearEncounterAt(startPoint, distance);
  }
  /** @override */
  getEncountersNear(startPoint, distance) {
    return gamestateMapHelper.getEncountersNear(startPoint, distance);
  }
  /** @override */
  getVisibleEncounterList() {
    return gamestateMapHelper.getVisibleEncounterList();
  }
  /** @override */
  updateLightLevelsAt(startPoint, lightLevel) {
    gamestateMapHelper.updateLightLevelsAt(startPoint, lightLevel);
  }
  // -- Encounter methods - gamestateEncounterHelper.js
  /** @override */
  resetEncounterHelper() {
    gamestateEncounterHelper.resetEncounterHelper();
  }
  /** @override */
  findAvailableEncounters(options = {}) {
    return gamestateEncounterHelper.findAvailableEncounters(options = {});
  }
  /** @override */
  generateRandomEncounter(options) {
    return gamestateEncounterHelper.generateRandomEncounter(options);
  }
  /** @override */
  findEncounterAt(point) {
    return gamestateEncounterHelper.findEncounterAt(point);
  }
  /** @override */
  findEncounterById(encounterId, options) {
    return gamestateEncounterHelper.findEncounterById(encounterId, options);
  }
  // -- Function Queue - gamestateFunctionQueueHelper.js
  /** @override */
  addToFunctionQueue(action, name) {
    gamestateFunctionQueueHelper.addToFunctionQueue(action, name);
  }
  /** @override */
  insertIntoFunctionQueue(action, name, idx) {
    gamestateFunctionQueueHelper.insertIntoFunctionQueue(action, name, idx);
  }
  /** @override */
  resolveFunctionQueue() {
    gamestateFunctionQueueHelper.resolveFunctionQueue();
  }
  /** @override */
  clearFunctionQueue() {
    gamestateFunctionQueueHelper.clearFunctionQueue();
  }
  /** @override */
  shouldResolveFunctionQueue() {
    return gamestateFunctionQueueHelper.shouldResolveFunctionQueue();
  }
  // -- General utility functions - gamestateDataHelper.js
  /** @override */
  canCharacterDoStuff(characterModel) {
    return gamestateDataHelper.canCharacterDoStuff(characterModel);
  }
  /** @override */
  getFormattedMapData() {
    return gamestateDataHelper.getFormattedMapData();
  }
  /** @override */
  getFormattedMapDataFor(characterModel) {
    return gamestateDataHelper.getFormattedMapDataFor(characterModel);
  }
}
/**
 * Gamestate Singleton
 *
 * @type {GamestateModel}
 */
const gameState = new GamestateModel();
export default gameState;
