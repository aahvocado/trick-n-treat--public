var path = require('path');
var nodeExternals = require('webpack-node-externals');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var { BUILD_PATH, APP_PATH, SHARED_PATH } = require('./app-paths.js');

module.exports = {
  mode: 'development',
  target: 'web',
  entry: './screen/src/app.js',
  output: {
    path: BUILD_PATH,
    filename: 'main.js'
  },
  resolve: {
    alias: {
      constants: path.resolve(SHARED_PATH, 'constants'),

      common: path.resolve(APP_PATH, 'js/common'),
      components: path.resolve(APP_PATH, 'js/components'),
      data: path.resolve(APP_PATH, 'js/data'),
      helpers: path.resolve(APP_PATH, 'js/helpers'),
      managers: path.resolve(APP_PATH, 'js/managers'),
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
      template: 'screen/public/index.html',
    })
  ],
};
