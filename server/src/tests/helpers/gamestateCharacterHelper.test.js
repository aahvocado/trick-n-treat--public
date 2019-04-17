import test from 'ava';
import Point from '@studiomoniker/point';

import {POINTS} from 'constants/points';
import {TILE_TYPES} from 'constants/tileTypes';
const NOPE = TILE_TYPES.EMPTY;
const PATH = TILE_TYPES.PATH;
const HOUS = TILE_TYPES.HOUSE;

import gameState from 'data/gameState';

import * as gamestateCharacterHelper from 'helpers/gamestateCharacterHelper';

import CharacterModel from 'models/CharacterModel';
import MapModel from 'models/MapModel';

import * as matrixUtils from 'utilities/matrixUtils';

test.beforeEach((t) => {
  // reset the gamestate for each test
  gameState.set({
    users: [],
    characters: [],
    tileMapModel: new MapModel(),
    houses: [],
    encounters: [],
  });
});

test('getRandomCharacterDirection() - (randomly) picks a valid directional Point based on the Characters position', (t) => {
  // -- setup
  const testMap = new MapModel({
    matrix: [
      [PATH, NOPE, PATH, PATH, HOUS],
      [PATH, NOPE, PATH, NOPE, NOPE],
      [PATH, NOPE, PATH, PATH, PATH],
      [PATH, NOPE, NOPE, NOPE, PATH],
      [HOUS, PATH, PATH, PATH, HOUS],
    ],
  });

  const testCharacter = new CharacterModel({
    name: 'TEST-CHAR-1',
    characterId: 'TEST-CHAR-ID-1',
    position: new Point(0, 0),
  });

  gameState.set({
    tileMapModel: testMap,
    characters: [testCharacter],
  });

  // -- test starts here
  const chosenPoint = gamestateCharacterHelper.getRandomCharacterDirection(testCharacter);
  t.true(chosenPoint.equals(POINTS.DOWN));
});

test('updateCharacterPosition() - correctly updates a Characters position if the direction is valid', (t) => {
  // -- setup
  const testMap = new MapModel({
    matrix: [
      [PATH, NOPE, PATH, PATH, HOUS],
      [PATH, NOPE, PATH, NOPE, NOPE],
      [PATH, NOPE, PATH, PATH, PATH],
      [PATH, NOPE, NOPE, NOPE, PATH],
      [HOUS, PATH, PATH, PATH, HOUS],
    ],
  });

  const testCharacter = new CharacterModel({
    name: 'TEST-CHAR-1',
    characterId: 'TEST-CHAR-ID-1',
    position: new Point(0, 0),
  });

  gameState.set({
    tileMapModel: testMap,
    fogMapModel: new MapModel({matrix: matrixUtils.createMatrix(testMap.getWidth(), testMap.getHeight())}),
    characters: [testCharacter],
  });

  // -- test starts here
  // valid move
  gamestateCharacterHelper.updateCharacterPosition(testCharacter, new Point(2, 2));
  t.true(testCharacter.get('position').equals(new Point(2, 2)));

  // invalid
  gamestateCharacterHelper.updateCharacterPosition(testCharacter, new Point(1, 1));
  t.true(testCharacter.get('position').equals(new Point(2, 2)));
});

test('updateCharacterPositionByDirection() - correctly updates a Characters position if the direction is valid', (t) => {
  // -- setup
  const testMap = new MapModel({
    matrix: [
      [PATH, NOPE, PATH, PATH, HOUS],
      [PATH, NOPE, PATH, NOPE, NOPE],
      [PATH, NOPE, PATH, PATH, PATH],
      [PATH, NOPE, NOPE, NOPE, PATH],
      [HOUS, PATH, PATH, PATH, HOUS],
    ],
  });

  const testCharacter = new CharacterModel({
    name: 'TEST-CHAR-1',
    characterId: 'TEST-CHAR-ID-1',
    position: new Point(0, 0),
  });

  gameState.set({
    tileMapModel: testMap,
    fogMapModel: new MapModel({matrix: matrixUtils.createMatrix(testMap.getWidth(), testMap.getHeight())}),
    characters: [testCharacter],
  });

  // -- test starts here
  // from the Start, they can move down
  gamestateCharacterHelper.updateCharacterPositionByDirection(testCharacter, 'down');
  t.true(testCharacter.get('position').equals(new Point(0, 1)));

  // but not right
  gamestateCharacterHelper.updateCharacterPositionByDirection(testCharacter, 'right');
  t.true(testCharacter.get('position').equals(new Point(0, 1)));
});
