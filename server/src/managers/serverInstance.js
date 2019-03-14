import express from 'express';
import http from 'http';

import * as websocketInstance from 'managers/websocketInstance';

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
    console.log('\x1b[36m', `Trick & Treat Server Started - localhost:${SERVER_PORT}`);
  });
}
