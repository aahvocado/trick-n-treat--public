import * as gamestateManager from 'managers/gamestateManager';

/**
 * handles interpreting Event messages from the Remote
 */

/** @type {socket.io-server} */
let websocketServer;

/**
 * should be called from `websocketInstance.js` and given the io server
 *
 * @param {socket.io-server} io
 */
export function start(io) {
  // save the reference
  websocketServer = io;

  // attach Websocket listeners
  websocketServer.on('connection', (socket) => {
    // on connection, send the client the current gamestate
    socket.emit('GAMESTATE_UPDATE', gamestateManager.gamestateModel.export());

    // user is taking an action
    socket.on('USER_ACTION', (actionId) => {
      handleUserAction('TEST_USER_ID', actionId);
    });
  });

  // attach Gamestate listeners
  gamestateManager.gamestateEmitter.on('UPDATES_COMPLETE', sendGamestate);
}
/**
 * sends all connected clients the entirity of the current gamestate
 */
export function sendGamestate() {
  console.log('sendGamestate()');
  websocketServer.emit('GAMESTATE_UPDATE', gamestateManager.gamestateModel.export());
}
/**
 * interprets an action from a user
 * @param {String} userId
 * @param {String} actionId
 */
function handleUserAction(userId, actionId) {
  // yuck, todo properly
  if (actionId === 'left' || actionId === 'right' || actionId === 'up' || actionId === 'down') {
    gamestateManager.updateCharacterPosition(userId, actionId);
  };
}
