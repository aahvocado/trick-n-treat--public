import * as connectionManager from 'managers/connectionManager';

export let gamestate;

export function start() {
  if (connectionManager.socket) {
    connectionManager.socket.on('GAMESTATE_UPDATE', (data) => {
      gamestate = data;
    })
  }
}
