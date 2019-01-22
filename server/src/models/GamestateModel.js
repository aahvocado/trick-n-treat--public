import schema from 'js-schema';
import MAP_SETTINGS from 'constants/mapSettings';

import Model from 'models/Model';
import MatrixModel from 'models/MatrixModel';

import * as mapGenerationUtils from 'utilities/mapGenerationUtils';

// define how our GameState should look like
const gamestateSchema = schema({
  // id of the game
  id: String,
  // id of the current game state (such as paused, waiting, etc)
  state: String,
  // connected users
  users: Array, // Array<UserModel>
  // characters that the users are controlling
  characters: Array, // Array<CharacterModel>
  // tiles that make up the world
  tileMapModel: MatrixModel,
  // data in each tile -- NOTE: this might be overkill, let's experiment with it later
  mapDataModel: MatrixModel,
  // objects/items that are in the world
  entities: Array, // Array<EntityModel> ???
  // characters that are in the world (similar to entities)
  npcs: Array, // Array<CharacterModel>

  // id of the character whose turn it is (consider how it could be an npc/entity?)
  activeCharacterId: String,
})
/**
 * our Gamestate is a Model
 */
export class GamestateModel extends Model {
  constructor(newAttributes = {}) {
    super(newAttributes);

    // apply default attributes and then override with given ones
    this.set(Object.assign({
      tileMapModel: undefined,
      mapDataModel: undefined,
      characters: undefined,
    }, newAttributes));

    // init everything
    this.initTilemapModel();
    this.refreshMapData();

    // set schema and then validate
    this.schema = gamestateSchema;
    // this.validate();
  }
  /**
   * generates a map
   */
  initTilemapModel() {
    this.set({tileMapModel: mapGenerationUtils.generateNewMatrixModel(MAP_SETTINGS)});
  }
  /**
   * updates the `mapDataModel` with data from everything else
   */
  refreshMapData() {
    // what data each tile can hold
    const defaultTileData = {
      characters: [],
    };

    // create a blank matrix with tilemap dimensions
    const tileMapModel = this.get('tileMapModel');
    const width = tileMapModel.getWidth();
    const height = tileMapModel.getHeight();
    const emptyMapMatrix = mapGenerationUtils.generateMatrix(width, height, defaultTileData);

    // build model
    const newMapDataModel = new MatrixModel({
      matrix: emptyMapMatrix,
    });

    // get characters
    const characters = this.get('characters');
    characters.forEach((characterModel) => {
      // update the Map with the users at their positions
      const position = characterModel.get('position');
      const existingTileData = newMapDataModel.getTileAt(position);
      existingTileData.characters.push(characterModel.id);
    })

    // done - set attribute
    this.set({mapDataModel: newMapDataModel});
  }
  /**
   * @param {String} id - `characterId`
   * @returns {CharacterModel}
   */
  findCharacter(id) {
    return this.get('characters').find((characterModel) => {
      return characterModel.get('characterId') === id;
    })
  }
  /**
   * @param {String} id - `userId`
   * @returns {UserModel}
   */
  findUser(id) {
    return this.get('users').find((userModel) => {
      return userModel.get('userId') === id;
    })
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
