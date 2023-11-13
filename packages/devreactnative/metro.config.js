const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');
const exclusionList = require('metro-config/src/defaults/exclusionList')
const escape = require('escape-string-regexp')

const sdkRootPath = path.resolve(__dirname, '../../');
const uiRoot = sdkRootPath + '/packages/sdk-ui';
console.log(`sdkRootPath: ${sdkRootPath}`);

const modules = [
  'react',
  'react-dom',
  'react-native',
  'react-native-safe-area-context',
]

const extraNodeModules = modules.reduce((acc, name) => {
  acc[name] = path.join(__dirname, 'node_modules', name)
  return acc
}, {});

const blacklistRE = exclusionList(
  modules.map(
    (m) =>
      new RegExp(`^${escape(path.join(uiRoot, 'node_modules', m))}\\/.*$`)
  )
);

console.log(`modules: `, modules)
console.log(`###################`)
console.log(`extraNodeModules`, extraNodeModules)
console.log(`###################`)
console.log(`blacklistRE`, blacklistRE)

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
      ...extraNodeModules,
      ...require('node-libs-react-native'),
      // crypto: require.resolve('react-native-quick-crypto'),
      // url: require.resolve('whatwg-url'),
    },
    blacklistRE: blacklistRE,
    // nodeModulesPaths: [
    //   './node_modules/',
    //   `${sdkRootPath}/packages/sdk-communication-layer/node_modules`,
    //   `${sdkRootPath}/packages/sdk/node_modules`,
    //   // `${sdkRootPath}/packages/sdk-ui/node_modules`,
    //   `${sdkRootPath}/node_modules`,
    // ],
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
      } else if (moduleName === '@metamask/sdk-ui') {
        console.debug(
          `CUSTOM RESOLVER ${moduleName}`,
          sdkRootPath + '/packages/sdk-ui/src/index.ts',
        );
        return {
          filePath: sdkRootPath + '/packages/sdk-ui/src/index.ts',
          type: 'sourceFile',
        };
      }
      //   // Optionally, chain to the standard Metro resolver.
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
