import test from 'ava';
import Point from '@studiomoniker/point';
import POINTS from 'constants/points';

import gameState from 'data/gameState';

import TILE_TYPES from 'constants/tileTypes';
const STAR = TILE_TYPES.START;
const NOPE = TILE_TYPES.EMPTY;
const PATH = TILE_TYPES.PATH;
const HOUS = TILE_TYPES.HOUSE;

import * as gamestateUserHelper from 'helpers/gamestateUserHelper';

import CharacterModel from 'models/CharacterModel';
// import EncounterModel from 'models/EncounterModel';
import MapModel from 'models/MapModel';
import UserModel from 'models/UserModel';

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

test('updateMovementActionsForUser() - accurately updates whether a User can move when at a corner', (t) => {
  // -- setup
  const testMap = new MapModel({
    matrix: [
      [STAR, NOPE, PATH, PATH, HOUS],
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

  const testUser = new UserModel({
    name: 'TEST-USER-1',
    userId: 'TEST-USER-ID-1',
    characterId: 'TEST-CHAR-ID-1',
  });

  gameState.set({
    tileMapModel: testMap,
    characters: [testCharacter],
    users: [testUser],
  });

  // -- test starts here
  // since the user is at the top left, we should expect they can only move down
  gamestateUserHelper.updateMovementActionsForUser(testUser);
  t.false(testUser.get('canMoveLeft'));
  t.false(testUser.get('canMoveRight'));
  t.false(testUser.get('canMoveUp'));
  t.true(testUser.get('canMoveDown'));
});
