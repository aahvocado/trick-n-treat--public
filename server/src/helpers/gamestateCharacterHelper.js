import {CLIENT_TYPE} from 'constants.shared/clientTypes';
import {ENCOUNTER_ACTION_ID} from 'constants.shared/encounterActions';
import {MAP_START} from 'constants/mapSettings';

import * as clientEventHelper from 'helpers/clientEventHelper';
import * as gamestateEncounterHelper from 'helpers/gamestateEncounterHelper';

import CharacterModel from 'models.shared/CharacterModel';

import gameState from 'state/gameState';
import serverState from 'state/serverState';

import logger from 'utilities/logger.game';
import * as conditionHandlerUtils from 'utilities/conditionHandlerUtils';

import * as jsonDataUtils from 'utilities.shared/jsonDataUtils';
import * as mapUtils from 'utilities.shared/mapUtils';

/**
 * this Helper is for `gameState` stuff that relates to Characters
 */

/**
 * makes Game Users out of given Client
 *
 * @param {ClientModel} clientModel
 * @returns {CharacterModel}
 */
export function createCharacterForClient(clientModel) {
  // only make users out of those in Game and Remote Clients
  if (!clientModel.get('isInGame') || clientModel.get('clientType') !== CLIENT_TYPE.REMOTE) {
    logger.error('Unable to create a Character for Client.');
    return;
  }

  const name = clientModel.get('name');
  const characterId = `${name}-character-id`;
  const clientId = clientModel.get('clientId');

  /** @todo - properly create character */
  const newCharacterModel = new CharacterModel({
    name: `${name}-character`,
    characterId: characterId,
    clientId: clientId,

    position: MAP_START.clone(),
    health: 4,
    movement: 4,
    sanity: 4,
    vision: 0,
  });

  // set the Character on the Client
  clientModel.set({characterModel: newCharacterModel});

  // done
  logger.game(`User "${clientModel.get('name')}" joined the game.`);
  return newCharacterModel;
}
/**
 * returns the Character whose is currently acting
 * (`null` probably means the game hasn't started, `undefined` means you bad)
 *
 * @returns {CharacterModel | null}
 */
export function getActiveCharacter() {
  // `activeCharacter` is usually the first character in the `turnQueue`
  //  but if the queue is empty then there's no character either
  const turnQueue = gameState.get('turnQueue').slice();
  if (turnQueue.length <= 0) {
    return null;
  };

  // find the character marked with `isActiveCharacter`
  const characters = gameState.get('characters').slice();
  const activeCharacter = characters.find((characterModel) => {
    return characterModel.get('isActiveCharacter');
  });

  return activeCharacter;
}
/**
 * finds all Characters at a given map Location
 *
 * @param {Point} point
 * @returns {Array<CharacterModel>}
 */
export function getCharactersAt(point) {
  return gameState.get('characters').filter((characterModel) => (point.equals(characterModel.get('position'))));
}
/**
 * @param {String} characterId
 * @returns {CharacterModel | undefined}
 */
export function findCharacterById(characterId) {
  return gameState.get('characters').find((characterModel) => {
    return characterModel.get('characterId') === characterId;
  });
}
/**
 * @param {String} clientId
 * @returns {CharacterModel | undefined}
 */
export function findCharacterByClientId(clientId) {
  return gameState.get('characters').find((characterModel) => {
    return characterModel.get('clientId') === clientId;
  });
}
/**
 * changes a Character's Position to given Position
 *
 * @param {CharacterModel} characterModel
 * @param {Point} position
 */
export function updateCharacterPosition(characterModel, position) {
  // nothing to do if given direction is not walkable
  if (!gameState.isWalkableAt(position)) {
    return;
  }

  // update the character's position and map visibility
  characterModel.set({position: position});
  gameState.updateToVisibleAt(position, characterModel.get('vision'));

  // finished if there is no Encounter here
  const encounterModel = gameState.findEncounterAt(position);
  if (encounterModel === undefined) {
    return;
  }

  // finished if there is an Encounter but Character can't trigger it
  // @todo - this is no longer correct
  if (!encounterModel.canTrigger(characterModel)) {
    return;
  }

  // if reached this far, then add the handler for the Encounter to the front of the `actionQueue`
  gameState.insertIntoActionQueue(() => {
    gamestateEncounterHelper.handleCharacterTriggerEncounter(characterModel, encounterModel);
  });
}
/**
 * attempts to move a Character tile by tile to a position
 *
 * @param {CharacterModel} characterModel
 * @param {Point} position
 */
export function moveCharacterTo(characterModel, position) {
  // do nothing if destination is unwalkable
  if (!gameState.isWalkableAt(position)) {
    return;
  }

  // find the potential path the Character will walk,
  const characterPos = characterModel.get('position');
  const grid = mapUtils.createGridForPathfinding(gameState.get('tileMapModel').get('matrix'));
  const movePath = mapUtils.getAStarPath(grid, characterPos, position);
  movePath.shift(); // remove the first point, which is the one the Character is on

  // check if destination is too far away
  const movement = characterModel.get('movement');
  if (movePath.length > movement) {
    return;
  }

  logger.verbose(`(moving "${characterModel.get('name')}" to [x: ${position.x}, y: ${position.y}])`);

  // take one step at a time for moving along the path
  movePath.forEach((pathPoint) => {
    gameState.addToActionQueue(() => {
      // subtract a Movement
      characterModel.modifyStat('movement', -1);

      // attempt to update the character's position
      updateCharacterPosition(characterModel, pathPoint);

      // handle end of action lifecycle
      gameState.insertIntoActionQueue(() => {
        gameState.handleEndOfAction(characterModel);
      });
    });
  });
}
/**
 * Character used an Item
 *  the character must have the item to use it
 *
 * @param {CharacterModel} characterModel
 * @param {ItemModel} itemModel
 */
export function handleCharacterUseItem(characterModel, itemModel) {
  // use the item
  characterModel.useItem(itemModel);

  // update
  clientEventHelper.sendGameUpdate();
}
/**
 * Character has chosen an Action
 *
 * @todo - I'm planning on letting CPU be able to do this too
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterId} encounterId
 * @param {ActionData} actionData
 */
export function handleCharacterChoseAction(characterModel, encounterId, actionData) {
  // check if the encounter they clicked on actually is the current one
  const activeEncounter = gameState.get('activeEncounter');
  if (activeEncounter.get('id') !== encounterId) {
    logger.warning(`"${characterModel.get('name')}" clicked on an action in an Encounter that was not the "ActiveEncounter".`);
    return;
  }

  // check if character was allowed to take this action
  const conditionList = jsonDataUtils.getConditionList(actionData);
  if (!conditionHandlerUtils.doesMeetAllConditions(characterModel, conditionList)) {
    logger.warning(`"${characterModel.get('name')}" used an action in "${activeEncounter.get('title')}" but did not meet conditions`);
    return;
  }

  // finally, we can handle the action
  const {
    actionId,
    gotoId,
  } = actionData;

  // just a basic confirmation to close the `Encounter`
  if (actionId === ENCOUNTER_ACTION_ID.CONFIRM) {
    // clear out `activeEncounter`
    gameState.set({activeEncounter: null});

    // tell the client their encounter is now null
    const clientModel = serverState.findClientByCharacter(characterModel);
    clientEventHelper.sendEncounterToClient(clientModel, null);

    // handle end of action lifecycle
    gameState.insertIntoActionQueue(() => {
      gameState.handleEndOfAction(characterModel);
    });
  }

  // this goes to another `Encounter`
  if (actionId === ENCOUNTER_ACTION_ID.GOTO) {
    gamestateEncounterHelper.handleEncounterActionGoTo(characterModel, gotoId);
  }
}
