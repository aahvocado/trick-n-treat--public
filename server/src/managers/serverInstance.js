import express from 'express';
import http from 'http';

import * as gamestateManager from 'managers/gamestateManager';
import * as websocketInstance from 'managers/websocketInstance';
import * as remoteCommunicationManager from 'managers/remoteCommunicationManager';

let app;
let server;

/**
 * Singleton for the Server
 */

/**
 * required to be called to instantiate the Express Server
 */
export function start() {
  app = express();
  app.get('/status', function(req, resp) {
    resp.send('Server is Up');
  });

  server = http.createServer(app);
  websocketInstance.start(server);

  // START!
  const SERVER_PORT = process.env.SERVER_PORT;
  server.listen(SERVER_PORT, async () => {
    console.log('\x1b[36m', `Trick & Treat Server Started - localhost:${SERVER_PORT}`); // cyan
  });

  // start debugging update
  debug_execute();
}

/**
 * debugging
 */
function debug_randomlyMoveCPU() {
  const characters = gamestateManager.gamestateModel.get('characters');
  characters.forEach((characterModel) => {
    if (characterModel.get('isCPU')) {
      const nextPosition = gamestateManager.getRandomCharacterDirection(characterModel);
      gamestateManager.updateCharacterPosition(characterModel.get('characterId'), nextPosition);
    }
  });
}
function debug_sendUpdate() {
  remoteCommunicationManager.sendGamestate();
}
/**
 * execute debug
 */
function debug_execute(n = 0) {
  if (n < 250) {
    console.log('debug_execute', n);
    debug_randomlyMoveCPU();
    debug_sendUpdate();
    setTimeout(debug_execute, 700, n + 1);
  } else {
    console.log('debug_done');
  }
};
