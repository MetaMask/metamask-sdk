const path = require('path')
const fs = require('fs')
const cracoBabelLoader = require('craco-babel-loader')

// Handle relative paths to sibling packages
const appDirectory = fs.realpathSync(process.cwd())
const resolvePackage = relativePath => path.resolve(appDirectory, relativePath)
const packagesToTranspile = [
  resolvePackage('../sdk-communication-layer'),
  resolvePackage('../sdk-install-modal-web'),
  resolvePackage('../sdk'),
  resolvePackage('../sdk-react'),
  resolvePackage('../sdk-react-ui'),
  resolvePackage('../sdk-lab'),
]

console.log(`Transpiling packages: ${packagesToTranspile.join('\n')}`)

module.exports = {
  // ...
  watchOptions: {
    followSymlinks: true,
    ignored: /node_modules/,
  },
  typescript: {
    enableTypeChecking: false /* (default value) */,
  },
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve = {
        ...webpackConfig.resolve,
        fallback: {
          "crypto": require.resolve("crypto-browserify"),
          "stream": require.resolve("stream-browserify")
        },
      };
      return webpackConfig;
    },
  },
  babel: {
    "presets": ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"],
    "plugins": [
      ["@babel/plugin-transform-class-properties", { "loose": true }],
      ["@babel/plugin-transform-private-methods", { "loose": true }],
      ["@babel/plugin-transform-private-property-in-object", { "loose": true }]
    ]
  },
  plugins: [
    {
      plugin: cracoBabelLoader,
      options: {
        includes: packagesToTranspile,
        excludes: [/node_modules/],
      }
    }
  ]
};
