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
  resolvePackage('../sdk-ui'),
  path.resolve('node_modules/@react-native/assets-registry/registry.js'),
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
        alias: {
          ...webpackConfig.resolve.alias,
          // 'react-native$': require.resolve('react-native-web'),
          // 'react-native/Libraries/Image/AssetRegistry': path.resolve(__dirname, 'mocks/AssetRegistry.js'),
        },
        fallback: {
          "crypto": require.resolve("crypto-browserify"),
          "stream": require.resolve("stream-browserify")
        },
      };
      webpackConfig.module.rules.push(
        // {
        //   test: /\.(js|jsx|mjs)$/,
        //   include: [
        //     // Add the path to the problematic module
        //     path.resolve('../sdk-ui/node_modules/@react-native/assets-registry/registry.js'),
        //     // Add other React Native modules if needed
        //   ],
        //   use: {
        //     loader: 'babel-loader',
        //     options: {
        //       presets: ['@babel/preset-react', '@babel/preset-flow'],
        //     },
        //   },
        // },
        {
          test: /\.ttf$/,
          loader: "url-loader", // or directly file-loader
          include: path.resolve(__dirname, "node_modules/react-native-vector-icons"),
        },
        {
          test: /\.js$/,
          exclude: /node_modules[/\\](?!react-native-vector-icons)/,
          include: [
            // Add the path to the problematic module
            path.resolve('../../packages/sdk-ui/node_modules/@react-native/assets-registry/registry.js'),
            // Add other React Native modules if needed
          ],
          use: {
            loader: "babel-loader",
            options: {
              // Disable reading babel configuration
              babelrc: false,
              configFile: false,

              // The configuration for compilation
              presets: [
                ["@babel/preset-env", { useBuiltIns: "usage" }],
                "@babel/preset-react",
                "@babel/preset-flow",
                "@babel/preset-typescript"
              ],
              plugins: [
                "@babel/plugin-proposal-class-properties",
                '@babel/plugin-syntax-jsx',
                "@babel/plugin-proposal-object-rest-spread"
              ]
            }
          }
        },
        {
          test: /\.(jpg|png|woff|woff2|eot|ttf|svg)$/,
          type: 'asset/resource'
        });
      // write resolve config for debug
      const webpackConfigPath = path.resolve(__dirname, './webpack.config.json');
      fs.writeFileSync(webpackConfigPath, JSON.stringify(webpackConfig, null, 2));
      console.log(`Wrote webpack config to ${webpackConfigPath}`);
      return webpackConfig;
    },
  },
  babel: {
    "presets": ["@babel/preset-env", "@babel/preset-react", "@babel/preset-flow", "@babel/preset-typescript"],
    "plugins": [
      ['@babel/plugin-syntax-jsx', { "loose": true }],
      ["@babel/plugin-proposal-class-properties", { "loose": true }],
      ["@babel/plugin-proposal-object-rest-spread", { "loose": true }],
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
