import {GAME_MODES} from 'constants.shared/gameModes';

import * as clientEventHelper from 'helpers/clientEventHelper';

import gameState from 'state/gameState';

import logger from 'utilities/logger.game';

/**
 * this Helper is for handling actions from the User
 */

/**
 * Client is joining a game in session
 *
 * @param {ClientModel} clientModel
 */
export function handleJoinGame(clientModel) {
  // can't join an inactive game
  if (gameState.get('mode') === GAME_MODES.INACTIVE) {
    return;
  }

  // only allow existing rejoins for now
  const clientId = clientModel.get('clientId');
  const existingCharacter = gameState.findCharacterByClientId(clientId);
  if (existingCharacter === undefined) {
    logger.game('Not allowing new Clients right now');
    return;
  };

  // update and send
  logger.game(`${clientModel.get('name')} successfully rejoined the game!`);
  clientModel.set({
    isInLobby: false,
    isInGame: true,
    characterModel: existingCharacter,
  });

  // update client on the lobby
  clientEventHelper.sendLobbyUpdate();

  // check if the user rejoined and it is actually their turn
  const activeCharacter = gameState.get('activeCharacter');
  const isActiveCharacter = activeCharacter.get('clientId') === clientId;

  // check if there is an `activeEncounter` to send them to finish
  const activeEncounter = gameState.get('activeEncounter');
  if (isActiveCharacter && activeEncounter !== null) {
    clientEventHelper.sendEncounterToClient(clientModel, activeEncounter);
  }

  // upate client on the game
  clientEventHelper.sendGameUpdate();
}
