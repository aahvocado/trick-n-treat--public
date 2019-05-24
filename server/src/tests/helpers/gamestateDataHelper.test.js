import test from 'ava';
import Point from '@studiomoniker/point';

import {TILE_TYPES} from 'constants.shared/tileTypes';
const {
  EMPTY,
  HOUSE,
  PATH,
} = TILE_TYPES;

import * as gamestateDataHelper from 'helpers/gamestateDataHelper';

import CharacterModel from 'models.shared/CharacterModel';
import EncounterModel from 'models.shared/EncounterModel';
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

test('getFormattedMapData() - formats gamestate data into expected object', (t) => {
  const testMap = new MapModel({
    matrix: [
      [PATH, EMPTY, PATH, PATH, HOUSE],
      [PATH, EMPTY, PATH, EMPTY, EMPTY],
      [PATH, EMPTY, PATH, PATH, PATH],
      [PATH, EMPTY, EMPTY, EMPTY, PATH],
      [HOUSE, PATH, PATH, PATH, HOUSE],
    ],
  });

  gameState.set({
    tileMapModel: testMap,
    fogMapModel: new MapModel(),
    encounters: [
      new EncounterModel({location: new Point(2, 2)}),
      new EncounterModel({location: new Point(4, 0)}),
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
  t.is(firstTile.encounterHere, undefined);
});
