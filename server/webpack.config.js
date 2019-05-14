var path = require('path');
var nodeExternals = require('webpack-node-externals');

const srcPath = path.resolve(__dirname, './src/');
const sharedPath = path.resolve('../shared/src');

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
      collections: path.resolve(srcPath, 'collections'),
      constants: path.resolve(srcPath, 'constants'),
      data: path.resolve(srcPath, 'data'),
      helpers: path.resolve(srcPath, 'helpers'),
      managers: path.resolve(srcPath, 'managers'),
      models: path.resolve(srcPath, 'models'),
      tests: path.resolve(srcPath, 'tests'),
      utilities: path.resolve(srcPath, 'utilities'),

      'constants.shared': path.resolve(sharedPath, 'constants'),
      'data.shared': path.resolve(sharedPath, 'data'),
      'helpers.shared': path.resolve(sharedPath, 'helpers'),
      'models.shared': path.resolve(sharedPath, 'models'),
      'utilities.shared': path.resolve(sharedPath, 'utilities'),
    }
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        include: [srcPath, sharedPath],
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
