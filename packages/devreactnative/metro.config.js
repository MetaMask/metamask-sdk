const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const sdkRootPath = path.resolve(__dirname, '../../');
console.log(`sdkRootPath: ${sdkRootPath}`);

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  watchFolders: [sdkRootPath],
  resolver: {
    extraNodeModules: {
      ...require('node-libs-react-native'),
      'react-native': path.resolve(__dirname, 'node_modules/react-native'),
      // crypto: require.resolve('react-native-quick-crypto'),
      // url: require.resolve('whatwg-url'),
    },
    nodeModulesPaths: [
      './node_modules/',
      `${sdkRootPath}/packages/sdk-communication-layer/node_modules`,
      `${sdkRootPath}/packages/sdk/node_modules`,
      `${sdkRootPath}/node_modules`,
    ],
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName === '@metamask/sdk-communication-layer') {
        console.debug(`CUSTOM RESOLVER ${moduleName}`);
        // Logic to resolve the module name to a file path...
        // NOTE: Throw an error if there is no resolution.
        return {
          filePath:
            sdkRootPath + '/packages/sdk-communication-layer/src/index.ts',
          type: 'sourceFile',
        };
      } else if (moduleName === '@metamask/sdk') {
        console.debug(
          `CUSTOM RESOLVER ${moduleName}`,
          sdkRootPath + '/packages/sdk/src/index.ts',
        );
        return {
          filePath: sdkRootPath + '/packages/sdk/src/index.ts',
          type: 'sourceFile',
        };
      }
    //   // Optionally, chain to the standard Metro resolver.
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
