/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const sdkRootPath = __dirname + '/../../../';

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  // watchFolders: [sdkRootPath],
  resolver: {
    // nodeModulesPaths: [
    // `./node_modules/`,
    // `${sdkRootPath}packages/sdk-communication-layer/node_modules`,
    // `${sdkRootPath}packages/sdk/node_modules`,
    // `${sdkRootPath}node_modules`,
    // ],
    extraNodeModules: {
      ...require('node-libs-react-native'),
      // crypto: require.resolve('react-native-quick-crypto'),
      // url: require.resolve('whatwg-url'),
    },
    resolveRequest: (context, moduleName, platform) => {
      // if (moduleName === '@metamask/sdk-communication-layer') {
      //   console.debug(`CUSTOM RESOLVER ${moduleName}`);
      //   // Logic to resolve the module name to a file path...
      //   // NOTE: Throw an error if there is no resolution.
      //   return {
      //     filePath:
      //       sdkRootPath + 'packages/sdk-communication-layer/src/index.ts',
      //     type: 'sourceFile',
      //   };
      // } else if (moduleName === '@metamask/sdk') {
      //   console.debug(
      //     `CUSTOM RESOLVER ${moduleName}`,
      //     sdkRootPath + 'packages/sdk/src/index.ts',
      //   );
      //   return {
      //     filePath: sdkRootPath + 'packages/sdk/src/index.ts',
      //     type: 'sourceFile',
      //   };
      // }
      // Optionally, chain to the standard Metro resolver.
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};
