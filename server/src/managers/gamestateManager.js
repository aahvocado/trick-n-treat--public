import schema from 'js-schema';

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
  // tiles that make up the world - 2D Array???
  map: Array, // Array<Tiles> ???
  // objects/items that are in the world
  entities: Array, // Array<EntityModel> ???
  // characters that are in the world (similar to entities)
  npcs: Array, // Array<CharacterModel>

  // id of the character whose turn it is (consider how it could be an npc/entity?)
  activeCharacterId: String,
})
// It's the BRAIN!
const GAMESTATE = {
  map: [],
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
  GAMESTATE.map = mapGenerationUtils.generateMap({
    width: 20,
    height: 20,
    numSpecials: 10,
  });
}
/**
 * starts everything
 */
export function start() {
  initMap();
  console.log(getGamestate().map);
}

