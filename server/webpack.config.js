var path = require('path');
var webpack = require('webpack');
var nodeExternals = require('webpack-node-externals');

const serverPath = path.resolve(__dirname, './src/');

module.exports = {
  mode: 'development',
  target: 'node',
  entry: {
    main: './src/index.js',
    tests: './src/tests/tests.index.js',
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].compiled.js'
  },
  resolve: {
    alias: {
      collections: path.resolve(serverPath, 'collections'),
      constants: path.resolve(serverPath, 'constants'),
      data: path.resolve(serverPath, 'data'),
      managers: path.resolve(serverPath, 'managers'),
      models: path.resolve(serverPath, 'models'),
      tests: path.resolve(serverPath, 'tests'),
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
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "eslint-loader",
        options: {
          failOnError: false,
          emitWarning: true,
        }
      }
    ]
  },
};
