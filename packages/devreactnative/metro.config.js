const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const escape = require('escape-string-regexp');

const sdkRootPath = path.resolve(__dirname, '../../');
const uiRoot = sdkRootPath + '/packages/sdk-ui';
const hooksRoot = sdkRootPath + '/packages/sdk-react';
console.log(`sdkRootPath: ${sdkRootPath}`);

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

// Create the first blacklist regular expressions array
const blacklistRE1 = modules.map(
  m => new RegExp(`^${escape(path.join(uiRoot, 'node_modules', m))}\\/.*$`),
);

// Create the second blacklist regular expressions array
const blacklistRE2 = modules.map(
  m => new RegExp(`^${escape(path.join(hooksRoot, 'node_modules', m))}\\/.*$`),
);

// Combine the two arrays
const combinedBlacklistRE = [...blacklistRE1, ...blacklistRE2];

// Create a single exclusion list using the combined array
const finalBlacklistRE = exclusionList(combinedBlacklistRE);

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
  watchFolders: [sdkRootPath+'/packages/'],
  resolver: {
    extraNodeModules: {
      ...extraNodeModules,
      ...require('node-libs-react-native'),
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
      } else if (moduleName === '@metamask/sdk-react') {
        console.debug(
          `CUSTOM RESOLVER ${moduleName}`,
          sdkRootPath + '/packages/sdk-react/src/index.ts',
        );
        return {
          filePath: sdkRootPath + '/packages/sdk-react/src/index.ts',
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

module.exports = mergeConfig(defaultConfig, config);
