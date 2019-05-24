import test from 'ava';
import Point from '@studiomoniker/point';

import {TILE_TYPES} from 'constants.shared/tileTypes';
const {
  EMPTY,
  HOUSE,
  PATH,
} = TILE_TYPES;

import * as gamestateUserHelper from 'helpers/gamestateUserHelper';

import CharacterModel from 'models.shared/CharacterModel';
import MapModel from 'models.shared/MapModel';
import UserModel from 'models.shared/UserModel';

import gameState from 'state/gameState';

test.beforeEach((t) => {
  // reset the gamestate for each test
  gameState.set({
    users: [],
    characters: [],
    tileMapModel: new MapModel(),
    encounters: [],
  });
});

test('updateMovementActionsForUser() - accurately updates whether a User can move when at a corner', (t) => {
  // -- setup
  const testMap = new MapModel({
    matrix: [
      [PATH, EMPTY, PATH, PATH, HOUSE],
      [PATH, EMPTY, PATH, EMPTY, EMPTY],
      [PATH, EMPTY, PATH, PATH, PATH],
      [PATH, EMPTY, EMPTY, EMPTY, PATH],
      [HOUSE, PATH, PATH, PATH, HOUSE],
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
