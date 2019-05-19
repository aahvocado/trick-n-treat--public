import '@babel/polyfill';

import dotenv from 'dotenv-flow';
dotenv.config({
  node_env: process.env.NODE_ENV || 'development',
  cwd: '../',
});

import * as serverInstance from 'managers/serverInstance';
serverInstance.init();

import serverState from 'data/serverState';
import 'data/gameState';

const autostartGame = false;
if (autostartGame) {
  serverState.handleStartGame();
}
