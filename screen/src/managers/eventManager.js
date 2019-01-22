import * as connectionManager from 'managers/connectionManager';
import { generateTiles } from 'managers/threejsManager';

export let gamestate;

export function start() {
  console.log('eventManager start(): ', connectionManager.socket);
  if (connectionManager.socket) {
    connectionManager.socket.on('GAMESTATE_UPDATE', (data) => {
      // console.log('GAMESTATE_UPDATE', e);
      gamestate = data;
      generateTiles();
    })
  }
}
