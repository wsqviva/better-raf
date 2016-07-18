'use strict';

const path = require('path');
const webpack = require('webpack');

var common = {
  entry: './src/index'
};

let config;

switch(process.env.npm_lifecycle_event) {
  case 'build':
    config = Object.assign({}, common, {
      output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'raf.js',
        library: 'raf',
        libraryTarget: 'umd'
      },
      plugins: [
        new webpack.DefinePlugin({
          'process.env': {
            NODE_ENV: 'production'
          }
        })
      ],
      devtool: 'source-map'
    });
    break;

  case 'start':
    config = Object.assign({}, common, {
      output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'raf.js'
      },
      devServer: {
        historyApiFallback: true,
        stats: 'errors-only',
        inline: true,
        host: '0.0.0.0',
        port: 3003
      },
      devtool: 'eval-source-map'
    });
    break;
}

module.exports = config;