/**
 * @typedef {String} ClientAction
 */
export const CLIENT_ACTIONS = {
  // in lobby
  LOBBY: {
    READY: 'ACTIONS.LOBBY.READY',
    UNREADY: 'ACTIONS.LOBBY.UNREADY',
    START: 'ACTIONS.LOBBY.START',
  },
  // in game
  MOVE: {
    LEFT: 'ACTIONS.MOVE.LEFT',
    RIGHT: 'ACTIONS.MOVE.RIGHT',
    UP: 'ACTIONS.MOVE.UP',
    DOWN: 'ACTIONS.MOVE.DOWN',
  },
  TRICK: 'ACTIONS.TRICK',
  TREAT: 'ACTIONS.TREAT',
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
