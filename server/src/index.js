import "@babel/polyfill";

import dotenv from 'dotenv-flow';
dotenv.config({
  node_env: process.env.NODE_ENV || 'development',
  cwd: '../',
});

import * as serverInstance from 'managers/serverInstance';
import * as gamestateManager from 'managers/gamestateManager';

serverInstance.start();
gamestateManager.start();
