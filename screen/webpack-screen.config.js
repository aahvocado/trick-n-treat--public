var path = require('path');
var nodeExternals = require('webpack-node-externals');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var { BUILD_PATH } = require('./app-paths.js');

module.exports = {
  mode: 'development',
  target: 'web',
  entry: './src/app.js',
  output: {
    path: BUILD_PATH,
    filename: 'main.js'
  },
  resolve: {
    alias: {
      constants: path.resolve('src/constants'),
      geometry: path.resolve('src/geometry'),
      common: path.resolve('src/common'),
      data: path.resolve('src/data'),
      components: path.resolve('src/components'),
      data: path.resolve('src/data'),
      helpers: path.resolve('src/helpers'),
      managers: path.resolve('src/managers'),
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
      template: 'public/index.html',
    })
  ],
};
