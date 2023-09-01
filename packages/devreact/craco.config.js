const path = require('path')
const fs = require('fs')
const cracoBabelLoader = require('craco-babel-loader')

// Handle relative paths to sibling packages
const appDirectory = fs.realpathSync(process.cwd())
const resolvePackage = relativePath => path.resolve(appDirectory, relativePath)

module.exports = {
  // ...
  typescript: {
    enableTypeChecking: false /* (default value) */,
  },
  babel: {
    "presets": ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"],
    "plugins": [
      ["@babel/plugin-transform-class-properties", { "loose": true }],
      ["@babel/plugin-transform-private-methods", { "loose": true }],
      ["@babel/plugin-transform-private-property-in-object", { "loose": true }]
    ]
  },
  // webpack: {
  //   alias: { /* ... */ },
  //   plugins: {
  //     add: [ /* ... */],
  //     remove: [ /* ... */],
  //   },
  //   configure: (webpackConfig, { env, paths }) => {
  //     /* ... */
  //     const { isFound, match } = getLoader(webpackConfig, loaderByName('babel-loader'));
  //     if (isFound) {
  //       console.log(`babel found at ${match.loader.include}`)
  //       const include = Array.isArray(match.loader.include) ? match.loader.include : [match.loader.include];
  //       match.loader.include = include.concat(packagesToTranspile);
  //       console.log(`babel include: `, match.loader.include)
  //     }
  //     return webpackConfig;
  //   },
  // },
  plugins: [
    {
      plugin: cracoBabelLoader,
      options: {
        // includes: packagesToTranspile,
        includes: [
          resolvePackage('../sdk-communication-layer'),
          resolvePackage('../sdk-install-modal-web'),
          resolvePackage('../sdk'),
          resolvePackage('../sdk-react'),
          resolvePackage('../sdk-react-ui'),
        ],
        excludes: [/node_modules/],
      }
    }
  ]
};
