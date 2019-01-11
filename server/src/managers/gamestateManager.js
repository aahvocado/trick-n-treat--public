import schema from 'js-schema';

import MapModel from 'models/MapModel';

import * as mapGenerationUtils from 'utilities/mapGenerationUtils';

// define how our GameState should look like
const gamestateSchema = schema({
  // id of the game
  id: String,
  // id of the current game state (such as paused, waiting, etc)
  state: String,
  // connected players
  players: Array, // Array<PlayerModel>
  // characters that the players are controlling
  characters: Array, // Array<CharacterModel>
  // tiles that make up the world
  mapModel: MapModel,
  // objects/items that are in the world
  entities: Array, // Array<EntityModel> ???
  // characters that are in the world (similar to entities)
  npcs: Array, // Array<CharacterModel>

  // id of the character whose turn it is (consider how it could be an npc/entity?)
  activeCharacterId: String,
})
// It's the BRAIN!
const GAMESTATE = {
  mapModel: undefined,
}
/**
 * @returns {Object}
 */
export function getGamestate() {
  return GAMESTATE;
}
/**
 * generates a map
 */
function initMap() {
  GAMESTATE.mapModel = mapGenerationUtils.generateNewMapModel({
    width: 21,
    height: 21,
  })
}
/**
 * initializes gamestate, effectively regenerating everything
 */
function initGamestate() {
  initMap();
}
/**
 * starts everything
 */
export function start() {
  initGamestate();
  console.log(getGamestate().mapModel.get('map'));
}

