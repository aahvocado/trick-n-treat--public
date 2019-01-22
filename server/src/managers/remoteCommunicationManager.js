import * as gamestateManager from 'managers/gamestateManager';

import POINTS from 'constants/points';

/** @type {socket.io-server} */
let websocketServer;

/**
 * should be called from `websocketInstance.js` and given the io server
 *
 * @param {socket.io-server}
 */
export function start(io) {
  // save the reference
  websocketServer = io;

  // attach listeners for events
  websocketServer.on('connection', (socket) => {
    // on connection, send the client the current gamestate
    socket.emit('GAMESTATE_UPDATE', gamestateManager.gamestateModel.export());

    // user is taking an action
    socket.on('USER_ACTION', (actionId) => {
      handleUserAction('TEST_USER_ID', actionId)
    });
  })
}
/**
 * sends all connected clients the entirity of the current gamestate
 */
export function sendGamestate() {
  websocketServer.emit('GAMESTATE_UPDATE', gamestateManager.gamestateModel.export());
}
/**
 * interprets an action from a user
 */
function handleUserAction(userId, actionId) {
  const characterModel = gamestateManager.gamestateModel.findUsersCharacter(userId);
  const characterId = characterModel.get('characterId');

  switch(actionId) {
    case 'left':
      gamestateManager.updateCharacterPosition(characterId, POINTS.LEFT);
      break;
    case 'right':
      gamestateManager.updateCharacterPosition(characterId, POINTS.RIGHT);
      break;
    case 'up':
      gamestateManager.updateCharacterPosition(characterId, POINTS.UP);
      break;
    case 'down':
      gamestateManager.updateCharacterPosition(characterId, POINTS.DOWN);
      break;
  }
}
