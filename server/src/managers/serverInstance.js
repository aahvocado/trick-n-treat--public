import express from 'express';
import http from 'http';

import * as websocketInstance from 'managers/websocketInstance';

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
    console.log('\x1b[36m', `Trick & Treat Server Started - localhost:${SERVER_PORT}`);
  });
}
