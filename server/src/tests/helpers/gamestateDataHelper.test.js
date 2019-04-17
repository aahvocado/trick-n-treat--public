import test from 'ava';
import Point from '@studiomoniker/point';

import {TILE_TYPES} from 'constants/tileTypes';
const NOPE = TILE_TYPES.EMPTY;
const PATH = TILE_TYPES.PATH;
const HOUS = TILE_TYPES.HOUSE;

import gameState from 'data/gameState';

import * as gamestateDataHelper from 'helpers/gamestateDataHelper';

import CharacterModel from 'models/CharacterModel';
import EncounterModel from 'models/EncounterModel';
import HouseModel from 'models/HouseModel';
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

test('getFormattedMapData() - formats gamestate data into expected object', (t) => {
  const testMap = new MapModel({
    matrix: [
      [PATH, NOPE, PATH, PATH, HOUS],
      [PATH, NOPE, PATH, NOPE, NOPE],
      [PATH, NOPE, PATH, PATH, PATH],
      [PATH, NOPE, NOPE, NOPE, PATH],
      [HOUS, PATH, PATH, PATH, HOUS],
    ],
  });

  gameState.set({
    tileMapModel: testMap,
    fogMapModel: new MapModel(),

    houses: [
      new HouseModel({position: new Point(0, 1)}),
    ],
    encounters: [
      new EncounterModel({position: new Point(2, 2)}),
      new EncounterModel({position: new Point(4, 0)}),
    ],
  });

  gameState.addUser(new UserModel({
    name: 'TEST_USER_NAME',
    userId: 'TEST_USER_ID',
    characterId: 'TEST-CHAR-ID-1',
  }));

  gameState.addCharacter(new CharacterModel({
    name: 'TEST-CHAR-1',
    characterId: 'TEST-CHAR-ID-1',
    position: new Point(0, 0),
  }));

  gameState.addCharacter(new CharacterModel({
    name: 'TEST-CHAR-2',
    characterId: 'TEST-CHAR-ID-2',
    position: new Point(4, 0),
  }));

  const formatResult = gamestateDataHelper.getFormattedMapData();

  const firstTile = formatResult[0][0];
  t.true(firstTile.position.equals(new Point(0, 0)));
  t.is(firstTile.tileType, PATH);
  t.is(firstTile.charactersHere[0].name, 'TEST-CHAR-1');
  t.is(firstTile.houseHere, undefined);
  t.is(firstTile.encounterHere, undefined);
});
