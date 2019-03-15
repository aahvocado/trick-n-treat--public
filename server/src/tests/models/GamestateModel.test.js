import test from 'ava';

import Point from '@studiomoniker/point';
import TILE_TYPES, {FOG_TYPES} from 'constants/tileTypes';

import CharacterModel from 'models/CharacterModel';
import EncounterModel from 'models/EncounterModel';
import GamestateModel from 'models/GamestateModel';
import MapModel from 'models/MapModel';
import UserModel from 'models/UserModel';

import * as gamestateUtils from 'utilities/gamestateUtils';

const STAR = TILE_TYPES.START;
const NOPE = TILE_TYPES.EMPTY;
const PATH = TILE_TYPES.PATH;
const HOUS = TILE_TYPES.HOUSE;

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
      [STAR, NOPE, PATH, PATH, PATH],
      [PATH, NOPE, PATH, NOPE, NOPE],
      [PATH, NOPE, PATH, PATH, PATH],
      [PATH, NOPE, NOPE, NOPE, PATH],
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

test('getEncounterAt() - find an Encounter if it exists in the List at that location', (t) => {
  const {testGamestate} = t.context;

  const testPoint = new Point(4, 4);
  if (testGamestate.getEncounterAt(testPoint) !== undefined) {
    return t.pass();
  }
});

test('getEncounterAt() - fail to find an Encounter if none in the List at that location', (t) => {
  const {testGamestate} = t.context;

  const testPoint = new Point(2, 2);
  if (testGamestate.getEncounterAt(testPoint) === undefined) {
    return t.pass();
  }
});

test('updateMovementActionsForUser() - accurately updates whether a User can move when at a corner', (t) => {
  const {testGamestate} = t.context;
  testGamestate.set({
    tileMapModel: new MapModel({
      matrix: [
        [STAR, NOPE],
        [PATH, NOPE],
      ],
    }),
  });

  const testCharacter = testGamestate.findCharacterById('TEST_CHARACTER_ID');
  const testUser = testGamestate.findUserById('TEST_USER_ID');

  testCharacter.set({position: new Point(0, 0)});
  testGamestate.updateMovementActionsForUser(testUser);

  t.false(testUser.get('canMoveLeft'));
  t.false(testUser.get('canMoveRight'));
  t.false(testUser.get('canMoveUp'));
  t.true(testUser.get('canMoveDown'));
});

test('updateLocationActionsForUser() - accurately updates whether a User can move when at a corner', (t) => {
  const {testGamestate} = t.context;
  const testMap = new MapModel({
    matrix: [
      [HOUS, PATH],
      [PATH, NOPE],
    ],
  });

  testGamestate.set({
    tileMapModel: testMap,
  });

  const testCharacter = testGamestate.findCharacterById('TEST_CHARACTER_ID');
  const testUser = testGamestate.findUserById('TEST_USER_ID');

  testCharacter.set({position: new Point(0, 0)});
  testGamestate.updateLocationActionsForUser(testUser);

  t.true(testUser.get('canTrick'));
  t.true(testUser.get('canTreat'));
});

test('updateToPartiallyVisibleAt() - changes the Fog of War map to partially visible at a given point', (t) => {
  const {testGamestate} = t.context;
  const testMap = new MapModel({
    matrix: [
      [HOUS, PATH],
      [PATH, NOPE],
    ],
  });

  const testFogMap = gamestateUtils.createFogOfWarModel(testMap);

  testGamestate.set({
    tileMapModel: testMap,
    fogMapModel: testFogMap,
  });

  const testCharacter = testGamestate.findCharacterById('TEST_CHARACTER_ID');
  testCharacter.set({position: new Point(0, 0)});

  const testPoint = new Point(0, 1);
  testGamestate.updateToPartiallyVisibleAt(testPoint);
  t.is(testFogMap.getTileAt(testPoint), FOG_TYPES.PARTIAL);
});
