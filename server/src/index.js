import '@babel/polyfill';

import dotenv from 'dotenv-flow';
dotenv.config({
  node_env: process.env.NODE_ENV || 'development',
  cwd: '../',
});

import * as serverInstance from 'managers/serverInstance';
serverInstance.init();

import 'data/serverState';
import 'data/gameState';
