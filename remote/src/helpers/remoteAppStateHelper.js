import remoteAppState from 'data/remoteAppState';

/**
 *
 * @returns {Boolean}
 */
export function isMyTurn(point) {
  const myUser = remoteAppState.get('myUser');
  return myUser.isUserTurn;
}
