import test from 'ava';
import Point from '@studiomoniker/point';

import {TILE_TYPES} from 'constants/tileTypes';
const {
  EMPTY,
  PATH,
} = TILE_TYPES;

import {GamestateModel} from 'data/gameState';

import CharacterModel from 'models/CharacterModel';
import EncounterModel from 'models/EncounterModel';
// import HouseModel from 'models/HouseModel';
import MapModel from 'models/MapModel';
import UserModel from 'models/UserModel';

// import * as mapGenerationUtils from 'utilities/mapGenerationUtils';

test.beforeEach((t) => {
  const testUser = new UserModel({
    name: 'TEST_USER_NAME',
    userId: 'TEST_USER_ID',
    characterId: 'TEST_CHARACTER_ID',
  });

  const testCharacter = new CharacterModel({
    name: 'TEST_CHARACTER_NAME',
    characterId: 'TEST_CHARACTER_ID',
    typeId: 'TEST_CHAR_TYPE_ID',
    position: new Point(0, 0),
  });

  const testMap = new MapModel({
    matrix: [
      [PATH, EMPTY, PATH, PATH, PATH],
      [PATH, EMPTY, PATH, EMPTY, EMPTY],
      [PATH, EMPTY, PATH, PATH, PATH],
      [PATH, EMPTY, EMPTY, EMPTY, PATH],
      [PATH, PATH, PATH, PATH, PATH],
    ],
  });

  const testEncounters = [
    new EncounterModel({position: new Point(0, 0)}),
    new EncounterModel({position: new Point(4, 0)}),
    new EncounterModel({position: new Point(4, 4)}),
  ];

  const testGamestate = new GamestateModel({
    users: [testUser],
    characters: [testCharacter],
    tileMapModel: testMap,
    encounters: testEncounters,
  });

  t.context = {
    testGamestate,
  };
});

test('findCharacterById() - finds the correct CharacterModel', (t) => {
  const {testGamestate} = t.context;

  const foundCharacterModel = testGamestate.findCharacterById('TEST_CHARACTER_ID');
  t.is(foundCharacterModel.get('name'), 'TEST_CHARACTER_NAME');
});

test('findUserById() - finds the correct UserModel', (t) => {
  const {testGamestate} = t.context;

  const foundUserModel = testGamestate.findUserById('TEST_USER_ID');
  t.is(foundUserModel.get('name'), 'TEST_USER_NAME');
});

test('findCharacterByUserId() - finds the correct CharacterModel', (t) => {
  const {testGamestate} = t.context;

  const foundCharacterModel = testGamestate.findCharacterByUserId('TEST_USER_ID');
  t.is(foundCharacterModel.get('name'), 'TEST_CHARACTER_NAME');
});

test('isWalkableAt() - determines PATH tile type as walkable', (t) => {
  const {testGamestate} = t.context;

  const testPoint = new Point(0, 0);
  t.true(testGamestate.isWalkableAt(testPoint));
});

test('isWalkableAt() - determines EMPTY tile type as not walkable', (t) => {
  const {testGamestate} = t.context;

  const testPoint = new Point(1, 1);
  t.false(testGamestate.isWalkableAt(testPoint));
});

test('findEncounterAt() - find an Encounter if it exists in the List at that location', (t) => {
  const {testGamestate} = t.context;

  const testPoint = new Point(4, 4);
  if (testGamestate.findEncounterAt(testPoint) !== undefined) {
    return t.pass();
  }
});

test('findEncounterAt() - fail to find an Encounter if none in the List at that location', (t) => {
  const {testGamestate} = t.context;

  const testPoint = new Point(2, 2);
  if (testGamestate.findEncounterAt(testPoint) === undefined) {
    return t.pass();
  }
});

test('addUser() - able to add a new user to the list', (t) => {
  const {testGamestate} = t.context;

  const newTestUser = new UserModel({
    name: 'TEST_USER_2',
    userId: 'TEST_USER_ID_2',
  });

  testGamestate.addUser(newTestUser);

  const users = testGamestate.get('users');
  t.is(users.length, 2);
});

test('removeUser() - removes given user from a list', (t) => {
  const {testGamestate} = t.context;

  const newTestUser = new UserModel({
    name: 'TEST_USER_2',
    userId: 'TEST_USER_ID_2',
  });

  testGamestate.addUser(newTestUser);
  t.is(testGamestate.get('users').length, 2);

  testGamestate.removeUser(newTestUser);
  t.is(testGamestate.get('users').length, 1);

  const users = testGamestate.get('users');
  const foundUser = users.find((user) => (user.id === newTestUser.id));
  t.is(foundUser, undefined);
});

// -- Map Getters
test('getCharactersAt() - finds correct list of Characters at a point', (t) => {
  const {testGamestate} = t.context;

  testGamestate.addCharacter(new CharacterModel({
    name: 'TEST_CHAR_0',
    characterId: 'TEST_CHAR_0',
    position: new Point(1, 1),
  }));

  testGamestate.addCharacter(new CharacterModel({
    name: 'TEST_CHAR_1',
    characterId: 'TEST_CHAR_1',
    position: new Point(1, 1),
  }));

  testGamestate.addCharacter(new CharacterModel({
    name: 'TEST_CHAR_2',
    characterId: 'TEST_CHAR_2',
    position: new Point(2, 2),
  }));

  const foundCharacters = testGamestate.getCharactersAt(new Point(1, 1));
  t.is(foundCharacters.length, 2);
  t.is(foundCharacters[0].get('name'), 'TEST_CHAR_0');
  t.is(foundCharacters[1].get('name'), 'TEST_CHAR_1');
});

test('getUsersAt() - finds correct list of Users with Characters at a point', (t) => {
  const {testGamestate} = t.context;

  // characters
  testGamestate.addCharacter(new CharacterModel({
    name: 'TEST_CHAR_0',
    characterId: 'TEST_CHAR_0',
    position: new Point(1, 1),
  }));

  testGamestate.addCharacter(new CharacterModel({
    name: 'TEST_CHAR_1',
    characterId: 'TEST_CHAR_1',
    position: new Point(1, 1),
  }));

  testGamestate.addCharacter(new CharacterModel({
    name: 'TEST_CHAR_2',
    characterId: 'TEST_CHAR_2',
    position: new Point(2, 2),
  }));

  // users
  testGamestate.addUser(new UserModel({
    name: 'TEST_USER_0',
    userId: 'TEST_USER_0',
    characterId: 'TEST_CHAR_0',
  }));

  testGamestate.addUser(new UserModel({
    name: 'TEST_USER_1',
    userId: 'TEST_USER_1',
    characterId: 'TEST_CHAR_1',
  }));

  testGamestate.addUser(new UserModel({
    name: 'TEST_USER_2',
    userId: 'TEST_USER_2',
    characterId: 'TEST_CHAR_2',
  }));

  const foundUsers = testGamestate.getUsersAt(new Point(1, 1));
  t.is(foundUsers.length, 2);
  t.is(foundUsers[0].get('name'), 'TEST_USER_0');
  t.is(foundUsers[1].get('name'), 'TEST_USER_1');
});
