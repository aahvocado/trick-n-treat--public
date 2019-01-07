import "@babel/polyfill";

import express from 'express';
import http from 'http';
import * as websocketServer from 'managers/websocketServer';


const SERVER_PORT = 666;

const app = express();
app.get('/status', function(req, resp) {
  resp.send('Server is up yo');
});

const server = http.createServer(app);
websocketServer.start(server);

// START!
server.listen(SERVER_PORT, async () => {
  console.log('\x1b[36m', `Trick & Treat Server Started - localhost:${SERVER_PORT}`);  //cyan
});
