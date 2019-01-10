var path = require('path');
var nodeExternals = require('webpack-node-externals');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var { BUILD_PATH, SERVER_PATH, SHARED_PATH } = require('./app-paths.js');

module.exports = {
  mode: 'development',
  target: 'node',
  entry: './server/server.js',
  output: {
    path: BUILD_PATH,
    filename: 'server.js'
  },
  resolve: {
    alias: {
      constants: path.resolve(SHARED_PATH, 'constants'),

      common: path.resolve(SERVER_PATH, 'js/common'),
      managers: path.resolve(SERVER_PATH, 'js/managers'),
    }
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
};
