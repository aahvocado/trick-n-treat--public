import dotenv from 'dotenv-flow';
dotenv.config({
  node_env: process.env.NODE_ENV || 'development',
  cwd: '../',
});

import "@babel/polyfill";

import * as serverInstance from 'managers/serverInstance';
serverInstance.start();
