const webpack = require('webpack'); // to access built-in plugins

const path = require('path');
const publicDir = path.join(__dirname, 'public');
const distDir = path.join(__dirname, 'dist');

const CopyPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const WebpackModules = require('webpack-modules');
const CompressionPlugin = require('compression-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const widgetConfig = require('./widget.config.json');
const pkg = require('./package.json');

const defaultConfig = {
  mode:'production',
  devServer: {
    contentBase: publicDir,
    port: 9000
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new WebpackModules(),
    new CleanWebpackPlugin({ protectWebpackAssets: false }),
    new CopyPlugin([{ from: 'public', to: './example' }]),
    new CompressionPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat'
    }
  }
};

const widgetFilename = widgetConfig.semanticReleases
  ? `${widgetConfig.widgetName}-${pkg.version}.js`
  : `${widgetConfig.widgetName}.js`;

  module.exports = [
    {
      ...defaultConfig,
      target: 'web',
      optimization: {
        minimizer: [new UglifyJsPlugin()]
      },
      entry: './src/EmbeddableWidget.tsx',
      output: {
        path: distDir,
        publicPath: '/',
        filename: widgetFilename,
        libraryTarget: 'module',
        module: true
      },
      experiments:{
        outputModule: true
      }
    }
  ];
  