var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var { BUILD_PATH } = require('./app-paths.js');

const srcPath = path.resolve(__dirname, './src/');
const sharedPath = path.resolve('../shared/src');

module.exports = {
  mode: 'development',
  target: 'web',
  entry: './src/index.js',
  output: {
    path: BUILD_PATH,
    filename: 'screen.js'
  },
  resolve: {
    alias: {
      constants: path.resolve(srcPath, 'constants'),
      geometry: path.resolve(srcPath, 'geometry'),
      common: path.resolve(srcPath, 'common'),
      components: path.resolve(srcPath, 'components'),
      data: path.resolve(srcPath, 'data'),
      helpers: path.resolve(srcPath, 'helpers'),
      managers: path.resolve(srcPath, 'managers'),

      'constants.shared': path.resolve(sharedPath, 'constants'),
      'utilities.shared': path.resolve(sharedPath, 'utilities'),
    }
  },
  devtool: 'source-map',
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
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/screen.html',
    })
  ],
};
