import seedrandom from 'seedrandom';
import {extendObservable} from 'mobx';

import {GAME_MODES} from 'constants.shared/gameModes';
import {FOG_TYPES} from 'constants.shared/tileTypes';

import * as gamestateActionHelper from 'helpers/gamestateActionHelper';
import * as gamestateCharacterHelper from 'helpers/gamestateCharacterHelper';
import * as gamestateEncounterHelper from 'helpers/gamestateEncounterHelper';
import * as gamestateLifecycleHelper from 'helpers/gamestateLifecycleHelper';
import * as gamestateMapHelper from 'helpers/gamestateMapHelper';

import CharacterModel from 'models.shared/CharacterModel';
import EncounterModel from 'models.shared/EncounterModel';
import MapModel from 'models.shared/MapModel';
import Model from 'models.shared/Model';
import ModelList from 'models.shared/ModelList';

import logger from 'utilities/logger.game';

import * as fogUtils from 'utilities.shared/fogUtils';
import * as mapUtils from 'utilities.shared/mapUtils';

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
      mode: GAME_MODES.INACTIVE,
      /** @type {Array<CharacterModel>} */
      turnQueue: [],
      /** @type {Array<GameAction>} */
      actionQueue: [],
      /** @type {GameAction | null} */
      activeAction: null,
      /** @type {EncounterModel | null} */
      activeEncounter: null,
      /** @type {Number} */
      round: 0,

      // -- Entity attributes
      /** @type {ModelList<CharacterModel>} */
      characterList: new ModelList([], CharacterModel),
      /** @type {ModelList<EncounterModel>} */
      encounterList: new ModelList([], EncounterModel),
      /** @type {MapModel} */
      tileMapModel: new MapModel(),
      /** @type {MapModel} */
      fogMapModel: new MapModel(),
      /** @type {ModelList<MapModel>} */
      biomeList: new ModelList([], MapModel),

      /** @type {String} */
      seed: seed,
      /** @type {Object} */
      ...newAttributes,
    });

    // computed attributes - (have to pass in `this` as context because getters have their own context)
    const _this = this;
    extendObservable(this.attributes, {
      /** @type {CharacterModel | null} */
      get activeCharacter() {
        return _this.getActiveCharacter();
      },
      /** @type {ModelList<EncounterModel>} */
      get visibleEncounterList() {
        // no characters mean nothing is visible
        const characterList = _this.get('characterList');
        if (characterList.length <= 0) {
          return new ModelList([], EncounterModel);
        }

        const encounterList = _this.get('encounterList');
        const tileMapModel = _this.get('tileMapModel');

        // go through all the Encounters
        const visibleEncounters = encounterList.filter((encounterModel) => {
          const encounterLocation = encounterModel.get('location');

          // check if any of the Characters can see this Encounter
          const isVisibleToAnyCharacter = characterList.some((characterModel) => {
            const characterLocation = characterModel.get('position');
            const characterRange = characterModel.get('vision');
            return tileMapModel.isWithinPathDistance(encounterLocation, characterLocation, characterRange);
          });

          // this Encounter is visible as long as any character can see it
          return isVisibleToAnyCharacter;
        });

        // return the visible encounters as a ModelList
        return new ModelList(visibleEncounters, EncounterModel);
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
  // -- Character methods - gamestateCharacterHelper.js
  /** @override */
  createCharacterForClient(clientModel) {
    return gamestateCharacterHelper.createCharacterForClient(clientModel);
  }
  /** @override */
  getActiveCharacter() {
    return gamestateCharacterHelper.getActiveCharacter();
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
  handleCharacterChoseAction(characterModel, encounterId, actionData) {
    gamestateCharacterHelper.handleCharacterChoseAction(characterModel, encounterId, actionData);
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
  hasNearbyEncountersOnPath(startPoint, distance) {
    return gamestateMapHelper.hasNearbyEncountersOnPath(startPoint, distance);
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
  // -- Action Queue - `gamestateActionHelper.js`
  /** @override */
  createActionFunction(action) {
    return gamestateActionHelper.createActionFunction(action);
  }
  /** @override */
  addToActionQueue(action) {
    gamestateActionHelper.addToActionQueue(action);
  }
  /** @override */
  insertIntoActionQueue(action, idx = 0) {
    gamestateActionHelper.insertIntoActionQueue(action, idx);
  }
  /** @override */
  resolveActionQueue() {
    gamestateActionHelper.resolveActionQueue();
  }
  /** @override */
  clearActionQueue() {
    gamestateActionHelper.clearActionQueue();
  }
  /** @override */
  shouldResolveActionQueue() {
    return gamestateActionHelper.shouldResolveActionQueue();
  }
  // -- Fog methods
  /**
   * updates Fog of War visibility to Fully visible at a given point
   *
   * @param {Point} point
   * @param {Number} distance
   */
  updateToVisibleAt(point, distance) {
    const fogMapModel = this.get('fogMapModel');
    const tileMapModel = this.get('tileMapModel');

    // given tile is now visible
    fogMapModel.setTileAt(point, FOG_TYPES.VISIBLE);

    // other tiles that are a given distance away should be partially visible, if not already
    const nearbyPoints = mapUtils.getPointsWithinPathDistance(tileMapModel.getMatrix(), point, Math.max(distance - 3, 0));
    nearbyPoints.forEach((point) => {
      fogUtils.updateFogPointToVisible(fogMapModel, tileMapModel, point);
    });
  }
}
/**
 * Gamestate Singleton
 *
 * @type {GamestateModel}
 */
const gameState = new GamestateModel();
export default gameState;
