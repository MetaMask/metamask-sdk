const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const escape = require('escape-string-regexp');

const monorepoRootPath = path.resolve(__dirname, '../../');
const sdkPath = monorepoRootPath + '/packages/sdk';
const sdkCommunicationLayerPath = monorepoRootPath + '/packages/sdk-communication-layer';
const uiRoot = monorepoRootPath + '/packages/sdk-ui';
const hooksRoot = monorepoRootPath + '/packages/sdk-react';
const socketServerRoot = monorepoRootPath + '/packages/sdk-socket-server-next';
console.log(`sdkRootPath: ${monorepoRootPath}`);

const modules = [
  'react',
  'react-dom',
  'react-native',
  'react-native-gesture-handler',
  'react-native-paper',
  'react-native-reanimated',
  'react-native-svg',
  'react-native-vector-icons',
  'react-native-safe-area-context',
];

const extraNodeModules = modules.reduce((acc, name) => {
  acc[name] = path.join(__dirname, 'node_modules', name);
  return acc;
}, {});


const finalBlacklistRE = exclusionList([
  // Exclude sdk-ui node_modules
  ...modules.map(
    m => new RegExp(`^${escape(path.join(uiRoot, 'node_modules', m))}\\/.*$`)
  ),
  // Exclude sdk-react node_modules
  ...modules.map(
    m => new RegExp(`^${escape(path.join(hooksRoot, 'node_modules', m))}\\/.*$`)
  ),
  // Exclude sdk-socket-server-next and its dist folder
  new RegExp(`^${escape(socketServerRoot)}\\/.*$`),
  new RegExp(`^${escape(socketServerRoot + '/dist')}\\/.*$`)
]);

console.log(`modules: `, modules);
console.log(`###################`);
console.log(`extraNodeModules`, extraNodeModules);
console.log(`###################`);
console.log(`finalBlacklistRE`, finalBlacklistRE);

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);
const {assetExts, sourceExts} = defaultConfig.resolver ?? {};
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
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  watchFolders: [sdkPath, sdkCommunicationLayerPath, uiRoot, hooksRoot],
  resolver: {
    extraNodeModules: {
      ...extraNodeModules,
      ...require('node-libs-react-native'),
      'node:crypto': require.resolve('react-native-crypto'),
      // crypto: require.resolve('react-native-quick-crypto'),
      // url: require.resolve('whatwg-url'),
    },
    assetExts: assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
    blacklistRE: finalBlacklistRE,
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
            monorepoRootPath + '/packages/sdk-communication-layer/src/index.ts',
          type: 'sourceFile',
        };
      } else if (moduleName === '@metamask/sdk') {
        console.debug(
          `CUSTOM RESOLVER ${moduleName}`,
          monorepoRootPath + '/packages/sdk/src/index.ts',
        );
        return {
          filePath: monorepoRootPath + '/packages/sdk/src/index.ts',
          type: 'sourceFile',
        };
      } else if (moduleName === '@metamask/sdk-react') {
        console.debug(
          `CUSTOM RESOLVER ${moduleName}`,
          monorepoRootPath + '/packages/sdk-react/src/index.ts',
        );
        return {
          filePath: monorepoRootPath + '/packages/sdk-react/src/index.ts',
          type: 'sourceFile',
        };
      } else if (moduleName === '@metamask/sdk-ui') {
        console.debug(
          `CUSTOM RESOLVER ${moduleName}`,
          monorepoRootPath + '/packages/sdk-ui/src/index.ts',
        );
        return {
          filePath: monorepoRootPath + '/packages/sdk-ui/src/index.ts',
          type: 'sourceFile',
        };
      }
       else if (moduleName === '@ecies/ciphers/aes') {
        console.debug(`CUSTOM RESOLVER ${moduleName}`);
        // Logic to resolve the module name to a file path...
        // NOTE: Throw an error if there is no resolution.
        return {
          filePath:
            sdkPath + '/node_modules/@ecies/ciphers/dist/aes/node.js',
          type: 'sourceFile',
        };
      } else if (moduleName === '@ecies/ciphers/chacha') {
        console.debug(`CUSTOM RESOLVER ${moduleName}`);
        // Logic to resolve the module name to a file path...
        // NOTE: Throw an error if there is no resolution.
        return {
          filePath:
            sdkPath + '/node_modules/@ecies/ciphers/dist/chacha/node.js',
          type: 'sourceFile',
        };
      }
      //   // Optionally, chain to the standard Metro resolver.
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
