import express from 'express';
import http from 'http';

import * as websocketInstance from 'managers/websocketInstance';

import logger from 'utilities/logger';

let app;
let server;

/**
 * instantiates the Express Server
 *  must be called
 */
export function init() {
  app = express();
  app.get('/status', function(req, resp) {
    resp.send('Server is Up');
  });

  server = http.createServer(app);

  // init Socket.IO on this server
  websocketInstance.init(server);

  // START!
  const SERVER_PORT = process.env.SERVER_PORT;
  server.listen(SERVER_PORT, async () => {
    logger.server(`Trick & Treat Server Started - localhost:${SERVER_PORT}`);
  });
}
