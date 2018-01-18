const path = require('path');
const webpack = require('webpack');

module.exports = function (env) {
  // NOTE: 'env' isn't currently used but can be provided by using --env.foo arguments on the command line

  var plugins; // set below

  if (process.env.NODE_ENV == 'production') {
    console.log('\nPRODUCTION BUILD\n');
    plugins = [
      new webpack.EnvironmentPlugin(['NODE_ENV']),
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      })
    ];
  } else {
    plugins = [];
  }

  return {
    entry: {
      App: './src/app.js'
    },
    output: {
      filename: './js/app.js'
    },
    resolve: {
      modules: ['node_modules', path.resolve('./src')]
    },
    plugins,
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['env', 'react'],
              plugins: ['transform-class-properties']
            }
          }
        }
      ]
    },
    devtool: "source-map"
  };
};
