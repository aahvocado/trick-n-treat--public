import schema from 'js-schema';
import MAP_SETTINGS from 'constants/mapSettings';
import {FOG_TYPES} from 'constants/tileTypes';

import Model from 'models/Model';
import MapModel from 'models/MapModel';

import * as matrixUtils from 'utilities/matrixUtils';

import * as encounterManager from 'managers/encounterManager';

// define how our GameState should look like
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
  'encounters': Array, // Array<String>
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
 * our Gamestate is a Model
 */
export class GamestateModel extends Model {
  /** @override */
  constructor(newAttributes = {}) {
    super(newAttributes);

    // apply default attributes and then override with given ones
    this.set(Object.assign({
      state: 'DEBUG',
    }, newAttributes));

    // init everything
    this.initTileMapModel();
    this.initEncounterList();
    this.initFogOfWarModel();

    // set schema and then validate
    this.schema = gamestateSchema;
    this.validate();
  }
  /**
   * generates a map
   */
  initTileMapModel() {
    const mapModel = new MapModel({mapConfig: MAP_SETTINGS});
    mapModel.generateMap();

    this.set({
      tileMapModel: mapModel,
    });
  }
  /**
   * generates the encounters
   */
  initEncounterList() {
    this.set({
      encounters: encounterManager.generateEncounters(this.get('tileMapModel')),
    });
  }
  /**
   * inits fog of war model
   */
  initFogOfWarModel() {
    const fogMapModel = new MapModel({
      start: MAP_SETTINGS.startPoint.clone(),
      matrix: matrixUtils.createMatrix(MAP_SETTINGS.width, MAP_SETTINGS.height, FOG_TYPES.HIDDEN),
    });
    this.set({fogMapModel: fogMapModel});
  }
  /**
   * @param {String} id - `characterId`
   * @returns {CharacterModel}
   */
  findCharacter(id) {
    return this.get('characters').find((characterModel) => {
      return characterModel.get('characterId') === id;
    });
  }
  /**
   * @param {String} id - `userId`
   * @returns {UserModel}
   */
  findUser(id) {
    return this.get('users').find((userModel) => {
      return userModel.get('userId') === id;
    });
  }
  /**
   * @param {String} id - `userId`
   * @returns {CharacterModel}
   */
  findUsersCharacter(id) {
    const userModel = this.findUser(id);
    const characterId = userModel.get('characterId');
    return this.findCharacter(characterId);
  }
}

export default GamestateModel;
