const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
// const path = require('path');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    extraNodeModules: {
      ...require('node-libs-react-native'),
      'node:crypto': require.resolve('react-native-crypto'),
    },
    sourceExts: ['jsx', 'js', 'ts', 'tsx', 'cjs', 'json'], //add here
  },
};

module.exports = mergeConfig(defaultConfig, config);
