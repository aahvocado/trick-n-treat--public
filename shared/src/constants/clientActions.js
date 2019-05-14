/**
 * @typedef {String} ClientAction
 */
export const CLIENT_ACTIONS = {
  // in lobby
  LOBBY: {
    READY: 'CLIENT_ACTIONS.LOBBY.READY',
    UNREADY: 'CLIENT_ACTIONS.LOBBY.UNREADY',
    START: 'CLIENT_ACTIONS.LOBBY.START',
  },
  // in game
  MOVE: {
    LEFT: 'CLIENT_ACTIONS.MOVE.LEFT',
    RIGHT: 'CLIENT_ACTIONS.MOVE.RIGHT',
    UP: 'CLIENT_ACTIONS.MOVE.UP',
    DOWN: 'CLIENT_ACTIONS.MOVE.DOWN',
    TO: 'CLIENT_ACTIONS.MOVE.TO',
  },
  TRICK: 'CLIENT_ACTIONS.TRICK',
  TREAT: 'CLIENT_ACTIONS.TREAT',

  CHOICE: 'CLIENT_ACTIONS.CHOICE',
  USE_ITEM: 'CLIENT_ACTIONS.USE_ITEM',
};
/**
 * @param {ClientAction} clientAction
 * @returns {Boolean}
 */
export function isMovementAction(clientAction) {
  if (clientAction === CLIENT_ACTIONS.MOVE.LEFT) {
    return true;
  }
  if (clientAction === CLIENT_ACTIONS.MOVE.RIGHT) {
    return true;
  }
  if (clientAction === CLIENT_ACTIONS.MOVE.UP) {
    return true;
  }
  if (clientAction === CLIENT_ACTIONS.MOVE.DOWN) {
    return true;
  }

  return false;
}
