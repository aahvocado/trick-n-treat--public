import schema from 'js-schema';

import {isWalkableTile} from 'constants/tileTypes';
import POINTS from 'constants/points';
import TILE_TYPES, {FOG_TYPES} from 'constants/tileTypes';

import Model from 'models/Model';
import MapModel from 'models/MapModel';

const gamestateSchema = schema({
  // id of the current game state (such as paused, waiting, etc)
  'state': String,
  // connected users
  'users': Array, // Array<UserModel>
  // characters that the users are controlling
  'characters': Array, // Array<CharacterModel>
  // tiles that make up the world
  'tileMapModel': MapModel,
  // list of all encounters
  'encounters': Array, // Array<EncounterModel>
  // fog of war
  'fogMapModel': MapModel,
  // objects/items that are in the world
  '?entities': Array, // Array<EntityModel> ???
  // characters that are in the world (similar to entities)
  '?npcs': Array, // Array<CharacterModel>

  // id of the character whose turn it is (consider how it could be an npc/entity?)
  '?activeCharacterId': String,
});
/**
 * GameState model
 */
export class GamestateModel extends Model {
  /** @override */
  constructor(newAttributes = {}) {
    super({
      state: 'DEBUG',
      users: [],
      characters: [],
      tileMapModel: new MapModel(),
      encounters: [],
      fogMapModel: new MapModel(),
      ...newAttributes,
    });

    // set schema and then validate
    this.schema = gamestateSchema;
  }
  // -- helper methods
  /**
   * @param {String} id - `characterId`
   * @returns {CharacterModel}
   */
  findCharacterById(id) {
    return this.get('characters').find((characterModel) => {
      return characterModel.get('characterId') === id;
    });
  }
  /**
   * @param {String} id - `userId`
   * @returns {UserModel}
   */
  findUserById(id) {
    return this.get('users').find((userModel) => {
      return userModel.get('userId') === id;
    });
  }
  /**
   * @param {String} userId
   * @returns {CharacterModel}
   */
  findCharacterByUserId(userId) {
    const userModel = this.findUserById(userId);
    const characterId = userModel.get('characterId');
    return this.findCharacterById(characterId);
  }
  /**
   * @param {Point} point
   * @returns {Boolean}
   */
  isWalkableAt(point) {
    const tileMapModel = this.get('tileMapModel');
    const foundTile = tileMapModel.getTileAt(point);
    return isWalkableTile(foundTile);
  }
  /**
   * gets the Encounter if there is one at given point
   *
   * @param {Point} point
   * @returns {EncounterModel | undefined}
   */
  getEncounterAt(point) {
    const encounters = this.get('encounters');
    return encounters.find((encounterModel) => {
      const encounterPosition = encounterModel.get('position');
      return point.equals(encounterPosition);
    });
  }
  /**
   * @param {UserModel} userModel
   */
  addUser(userModel) {
    const oldUsers = this.get('users');
    const newUsers = [].concat(oldUsers);
    newUsers.push(userModel);
    this.set({users: newUsers});
  }
  /**
   * @param {UserModel} userModel
   */
  removeUser(userModel) {
    const oldUsers = this.get('users');
    const newUsers = oldUsers.filter((user) => (user.get('userId') !== userModel.get('userId')));
    this.set({users: newUsers});
  }
  /**
   * @param {CharacterModel} characterModel
   */
  addCharacter(characterModel) {
    const oldCharacters = this.get('characters');
    const newCharacters = [].concat(oldCharacters);
    newCharacters.push(characterModel);
    this.set({characters: newCharacters});
  }
  /**
   * @param {CharacterModel} characterModel
   */
  removeCharacter(characterModel) {
    const oldCharacters = this.get('characters');
    const newCharacters = oldCharacters.filter((character) => (character.get('characterId') !== characterModel.get('characterId')));
    this.set({characters: newCharacters});
  }
  // -- isolated update methods
  /**
   * updates all `canMove` attributes in a given user
   *
   * @param {UserModel} userModel
   */
  updateMovementActionsForUser(userModel) {
    const characterId = userModel.get('characterId');
    const characterModel = this.findCharacterById(characterId);

    userModel.set({
      canMoveLeft: this.isWalkableAt(characterModel.getPotentialPosition(POINTS.LEFT)),
      canMoveRight: this.isWalkableAt(characterModel.getPotentialPosition(POINTS.RIGHT)),
      canMoveUp: this.isWalkableAt(characterModel.getPotentialPosition(POINTS.UP)),
      canMoveDown: this.isWalkableAt(characterModel.getPotentialPosition(POINTS.DOWN)),
    });
  }
  /**
   * updates `canTrick` and `canTreat` attributes in a given user
   *
   * @param {UserModel} userModel
   */
  updateLocationActionsForUser(userModel) {
    const characterId = userModel.get('characterId');
    const characterModel = this.findCharacterById(characterId);

    const tileMapModel = this.get('tileMapModel');
    const isHouseTile = tileMapModel.isTileEqualTo(characterModel.get('position'), TILE_TYPES.HOUSE);

    userModel.set({
      canTrick: isHouseTile,
      canTreat: isHouseTile,
    });
  }
  /**
   * updates Fog of War visibility to Fully visible at a given point
   *
   * @param {Point} point
   */
  updateToVisibleAt(point) {
    const fogMapModel = this.get('fogMapModel');

    // given tile is now visible
    fogMapModel.setTileAt(point, FOG_TYPES.VISIBLE);

    // update adjacent points
    this.updateToPartiallyVisibleAt(point.clone().add(POINTS.LEFT));
    this.updateToPartiallyVisibleAt(point.clone().add(POINTS.RIGHT));
    this.updateToPartiallyVisibleAt(point.clone().add(POINTS.UP));
    this.updateToPartiallyVisibleAt(point.clone().add(POINTS.DOWN));
  }
  /**
   * updates Fog of War visibility to Partially visible at a given point
   *
   * @param {Point} point
   */
  updateToPartiallyVisibleAt(point) {
    const fogMapModel = this.get('fogMapModel');
    const tileMapModel = this.get('tileMapModel');

    // if already fully visibile, do nothing
    if (fogMapModel.isTileEqualTo(point, FOG_TYPES.VISIBLE)) {
      return;
    }

    // if adjacent tile is just an empty tile, let it be fully visible
    if (tileMapModel.isTileEqualTo(point, TILE_TYPES.EMPTY)) {
      fogMapModel.setTileAt(point, FOG_TYPES.VISIBLE);
      return;
    }

    // otherwise make it partially visible
    fogMapModel.setTileAt(point, FOG_TYPES.PARTIAL);
  }
  // -- larger scale update methods
  /**
   * updates every User's actions
   */
  updateActionsForAllUsers() {
    this.get('users').forEach((userModel) => {
      this.updateMovementActionsForUser(userModel);
      this.updateLocationActionsForUser(userModel);
    });
  }
}

export default GamestateModel;
