var path = require('path');
var nodeExternals = require('webpack-node-externals');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var { BUILD_PATH, REMOTE_PATH, SHARED_PATH } = require('./app-paths.js');

module.exports = {
  mode: 'development',
  target: 'web',
  entry: './remote/app.js',
  output: {
    path: BUILD_PATH,
    filename: 'main.js'
  },
  resolve: {
    alias: {
      constants: path.resolve(SHARED_PATH, 'constants'),

      common: path.resolve(REMOTE_PATH, 'common'),
      components: path.resolve(REMOTE_PATH, 'components'),
      data: path.resolve(REMOTE_PATH, 'data'),
      helpers: path.resolve(REMOTE_PATH, 'helpers'),
      managers: path.resolve(REMOTE_PATH, 'managers'),
    }
  },
  devtool: 'source-map',
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
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/screen-index.html',
    })
  ],
};
