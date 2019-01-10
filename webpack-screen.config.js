var path = require('path');
var nodeExternals = require('webpack-node-externals');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var { BUILD_PATH, SCREEN_PATH, SHARED_PATH } = require('./app-paths.js');

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
      constants: path.resolve(SCREEN_PATH, 'src/constants'),
      debug: path.resolve(SCREEN_PATH, 'src/debug'),
      input: path.resolve(SCREEN_PATH, 'src/input'),

      common: path.resolve(SCREEN_PATH, 'src/common'),
      components: path.resolve(SCREEN_PATH, 'src/components'),
      data: path.resolve(SCREEN_PATH, 'src/data'),
      helpers: path.resolve(SCREEN_PATH, 'src/helpers'),
      managers: path.resolve(SCREEN_PATH, 'src/managers'),
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
