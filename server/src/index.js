import '@babel/polyfill';

import dotenv from 'dotenv-flow';
dotenv.config({
  node_env: process.env.NODE_ENV || 'development',
  cwd: '../',
});

import 'data/serverAppState';
import 'data/gameState';

import * as serverInstance from 'managers/serverInstance';
serverInstance.init();
