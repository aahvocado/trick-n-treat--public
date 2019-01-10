var path = require('path');
var webpack = require('webpack');
var nodeExternals = require('webpack-node-externals');

const serverPath = path.resolve(__dirname, './src/');

module.exports = {
  mode: 'development',
  target: 'node',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'server.js'
  },
  resolve: {
    alias: {
      managers: path.resolve(serverPath, 'managers'),
      models: path.resolve(serverPath, 'models'),
      utilities: path.resolve(serverPath, 'utilities'),
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
