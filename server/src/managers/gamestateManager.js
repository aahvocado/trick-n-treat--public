import uuid from 'uuid/v4';
import seedrandom from 'seedrandom';

import MAP_SETTINGS from 'constants/mapSettings';
import TILE_TYPES, { isWalkableTile } from 'constants/tileTypes';

import Point from '@studiomoniker/point';
import GamestateModel from 'models/GamestateModel';
import CharacterModel from 'models/CharacterModel';
import PlayerModel from 'models/PlayerModel';

import * as mapGenerationUtils from 'utilities/mapGenerationUtils';
import * as matrixUtils from 'utilities/matrixUtils';

// replace seed if we find something we like or want to debug with
const seed = uuid();
seedrandom(seed, { global: true });

// instantiate Gamestate when this Module is called
export const gamestateModel = new GamestateModel({
  players: [
    new PlayerModel({
      name: 'Player Daidan',
      characterId: 'WOW_CHARACTER_ID_SO_UNIQUE',
    })
  ],

  characters: [
    new CharacterModel({
      name: 'Elmo',
      characterId: 'WOW_CHARACTER_ID_SO_UNIQUE',
      typeId: 'ELMO_CHARACTER',
      position: new Point(MAP_SETTINGS.startCoordinates[0], MAP_SETTINGS.startCoordinates[1]),
    })
  ],
});

/**
 * @param {Point} point
 * @returns {Boolean}
 */
export function isEmptyTile(point) {
  const tileMapModel = gamestateModel.get('tileMapModel');
  return tileMapModel.getTileAt(point, TILE_TYPES.EMPTY);
}
/**
 * @param {CharacterModel} characterModel
 * @returns {point}
 */
export function getRandomCharacterPosition(characterModel) {
  const currentPosition = characterModel.get('position');
  const directionPoint = mapGenerationUtils.getRandomDirection();
  const possiblePoint = currentPosition.add(directionPoint);

  // if tile is not empty, try again
  if (!isEmptyTile(possiblePoint)) {
    return getRandomCharacterPosition(characterModel);
  }

  // otherwise, that works
  return possiblePoint;
}
/**
 * updates all `canMove` attributes in each player
 */
export function updatePlayerMovementActions() {
  const tileMapModel = gamestateModel.get('tileMapModel');
  const players = gamestateModel.get('players');

  players.forEach((playerModel) => {
    const characterId = playerModel.get('characterId');
    const characterModel = gamestateModel.findCharacter(characterId);
    const position = characterModel.get('position');

    playerModel.set({
      canMoveLeft: isWalkableTile(tileMapModel.getTileAt(position.clone().subtractX(1))),
      canMoveRight: isWalkableTile(tileMapModel.getTileAt(position.clone().addX(1))),
      canMoveUp: isWalkableTile(tileMapModel.getTileAt(position.clone().addY(1))),
      canMoveDown: isWalkableTile(tileMapModel.getTileAt(position.clone().subtractY(1))),
    })
  });
}
/**
 * updates `canTrick` and `canTreat` attributes in each player
 *  todo - flesh this out later
 */
export function updatePlayerLocationActions() {
  const tileMapModel = gamestateModel.get('tileMapModel');
  const players = gamestateModel.get('players');

  players.forEach((playerModel) => {
    const characterId = playerModel.get('characterId');
    const characterModel = gamestateModel.findCharacter(characterId);
    const position = characterModel.get('position');

    const positionTile = tileMapModel.getTileAt(position);
    const isHouseTile = positionTile === TILE_TYPES.HOUSE;

    playerModel.set({
      canTrick: isHouseTile,
      canTreat: isHouseTile,
    })
  });
}
/**
 * debugging
 */
function debug_randomlyMoveCharacter(characterModel) {
  const nextPosition = getRandomCharacterPosition(characterModel);
  characterModel.set({position: nextPosition});

  updatePlayerMovementActions();
  console.log(gamestateModel.get('players')[0].attributes);

  // for debugging, make them do it again
  setTimeout(() => {
    debug_randomlyMoveCharacter(characterModel);
  }, 1000);
}

//
console.log('Gamestate Instanciated with seed', seed);
debug_randomlyMoveCharacter(gamestateModel.get('characters')[0]);
