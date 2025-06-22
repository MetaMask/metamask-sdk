import typescript from 'rollup-plugin-typescript2';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import nativePlugin from 'rollup-plugin-natives';
import jscc from 'rollup-plugin-jscc';
import terser from '@rollup/plugin-terser';
import { visualizer } from 'rollup-plugin-visualizer';
import packageJson from './package.json';
import replace from '@rollup/plugin-replace';
import path from 'path';
import nodePolyfills from 'rollup-plugin-polyfill-node';

const isDev = process.env.NODE_ENV === 'dev';

const umdGlobals = {
  'cross-fetch': 'fetch',
  eventemitter2: 'EventEmitter2',
  'socket.io-client': 'io',
  eciesjs: 'ECIES',
  debug: 'debug',
  uuid: 'uuid',
  'date-fns': 'dateFns',
  buffer: 'Buffer',
  'readable-stream': 'ReadableStream',
  tslib: 'tslib',
};

// Get dependencies from package.json
const allDependencies = [
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.peerDependencies || {}),
  ...Object.keys(packageJson.optionalDependencies || {}),
  '@react-native-async-storage/async-storage',
  'bufferutil',
  'utf-8-validate',
  'tslib',
  'buffer',
];

// Platform specific externals (only add platform-specific deps if needed)
const webExternalDeps = [...allDependencies];
const rnExternalDeps = [...allDependencies];
const nodeExternalDeps = [...allDependencies];

const getTypescriptPlugin = (platform) =>
  typescript({
    tsconfig: './tsconfig.build.json',
    tsconfigOverride: {
      compilerOptions: {
        declaration: true,
        declarationMap: true,
        sourceMap: true,
        outDir: 'dist',
        declarationDir:
          platform === 'web'
            ? path.dirname(packageJson.browser)
            : platform === 'rn'
            ? path.dirname(packageJson['react-native'])
            : path.dirname(packageJson.main),
        module: 'esnext',
        moduleResolution: 'node',
        importHelpers: true,
        noEmitHelpers: true,
      },
      include: ['./src'],
      exclude: ['**/*.spec.ts', '**/*.test.ts'],
    },
    useTsconfigDeclarationDir: true,
    clean: true,
    exclude: ['**/*.spec.ts', '**/*.test.ts'],
    check: !isDev,
  });

const sharedWarningHandler = (warning, warn) => {
  if (
    warning.code === 'CIRCULAR_DEPENDENCY' &&
    (warning.message.includes('RemoteCommunication/ConnectionManager') ||
      warning.message.includes('RemoteCommunication/EventListeners') ||
      warning.message.includes('RemoteCommunication/MessageHandlers'))
  ) {
    return;
  }

  if (warning.code === 'THIS_IS_UNDEFINED') return;
  warn(warning);
};

const getPlugins = ({ platform, minify = true }) => [
  replace({
    preventAssignment: true,
    values: {
      'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
      'process.env.PKG_VERSION': JSON.stringify(packageJson.version),
      'process.env.PKG_NAME': JSON.stringify(packageJson.name),
    },
  }),
  jscc({
    values: {
      _WEB: platform === 'web' ? 1 : 0,
      _REACTNATIVE: platform === 'rn' ? 1 : 0,
      _NODEJS: platform === 'node' ? 1 : 0,
    },
  }),
  getTypescriptPlugin(platform),
  nodeResolve({
    browser: platform === 'web',
    preferBuiltins: platform === 'node',
    exportConditions:
      platform === 'web'
        ? ['browser']
        : platform === 'rn'
        ? ['react-native', 'node']
        : ['node'],
    mainFields:
      platform === 'rn'
        ? ['react-native', 'browser', 'module', 'main']
        : ['browser', 'module', 'main'],
  }),
  commonjs({
    transformMixedEsModules: true,
    include: [/node_modules/, 'src/**'],
    exclude: [
      ...allDependencies.map((dep) => new RegExp(`node_modules/${dep}`)),
    ],
    ignoreTryCatch: true,
    ignore: (id) => {
      if (
        id.includes('RemoteCommunication/ConnectionManager') ||
        id.includes('RemoteCommunication/EventListeners') ||
        id.includes('RemoteCommunication/MessageHandlers')
      ) {
        return true;
      }
      return false;
    },
  }),
  platform === 'web' && globals(),
  platform === 'web' && builtins({
    crypto: true,
    buffer: false
  }),
  platform === 'web' && nodePolyfills({
    include: ['buffer']
  }),
  json(),
  minify && terser({
    format: { comments: false },
    compress: {
      passes: 2,
      drop_console: !isDev,
      pure_getters: true,
      unsafe_comps: true,
      unsafe_methods: true,
    },
    mangle: {
      reserved: ['Buffer', 'global', 'process'],
    },
  }),
  isDev && ['treemap', 'sunburst', 'network', 'raw-data', 'list'].map((template) =>
    visualizer({
      filename: `bundle_stats/${platform}/${
        packageJson.version
      }/${template}${
        template === 'list'
          ? '.txt'
          : template === 'raw-data'
          ? '.json'
          : '.html'
      }`,
      gzipSize: true,
      brotliSize: true,
      template,
    })
  ),
].filter(Boolean);

/**
 * @type {import('rollup').RollupOptions[]}
 */
const configs = [
  // Browser ES build
  {
    input: 'src/index.ts',
    output: {
      file: packageJson.browser,
      format: 'es',
      sourcemap: true,
      interop: 'auto',
    },
    // IMPORTANT: Using function-based external to handle sub-path imports
    // This fixes React Native crypto polyfill issues where uuid and eciesjs
    // were being bundled and couldn't access runtime crypto.getRandomValues
    // See CRYPTO_POLYFILL_FIX.md for details
    external: (id) => {
      // Always externalize uuid and eciesjs
      if (id === 'uuid' || id.startsWith('uuid/') || 
          id === 'eciesjs' || id.startsWith('eciesjs/')) {
        return true;
      }
      return webExternalDeps.includes(id);
    },
    plugins: getPlugins({ platform: 'web' }),
    onwarn: sharedWarningHandler,
  },

  // Browser UMD build
  {
    input: 'src/index.ts',
    output: {
      file: packageJson.unpkg,
      format: 'umd',
      name: 'MetaMaskSDKCommunication',
      sourcemap: true,
      globals: umdGlobals,
      interop: 'auto',
    },
    // IMPORTANT: Using function-based external to handle sub-path imports
    // This fixes React Native crypto polyfill issues where uuid and eciesjs
    // were being bundled and couldn't access runtime crypto.getRandomValues
    // See CRYPTO_POLYFILL_FIX.md for details
    external: (id) => {
      // Always externalize uuid and eciesjs for UMD
      if (id === 'uuid' || id.startsWith('uuid/') || 
          id === 'eciesjs' || id.startsWith('eciesjs/')) {
        return true;
      }
      return webExternalDeps.includes(id);
    },
    plugins: getPlugins({ platform: 'web' }),
    onwarn: sharedWarningHandler,
  },

  // React Native build
  {
    input: 'src/index.ts',
    output: {
      file: packageJson['react-native'],
      format: 'es',
      sourcemap: true,
      interop: 'auto',
    },
    // IMPORTANT: Using function-based external to handle sub-path imports
    // This fixes React Native crypto polyfill issues where uuid and eciesjs
    // were being bundled and couldn't access runtime crypto.getRandomValues
    // See CRYPTO_POLYFILL_FIX.md for details
    external: (id) => {
      if (id === 'uuid' || id.startsWith('uuid/') || 
          id === 'eciesjs' || id.startsWith('eciesjs/')) {
        return true;
      }
      return rnExternalDeps.includes(id);
    },
    plugins: getPlugins({ platform: 'rn' }),
    onwarn: sharedWarningHandler,
  },

  // Node.js builds
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
        interop: 'auto',
      },
      {
        file: packageJson.module,
        format: 'es',
        sourcemap: true,
        interop: 'auto',
      },
    ],
    // IMPORTANT: Using function-based external to handle sub-path imports
    // This fixes React Native crypto polyfill issues where uuid and eciesjs
    // were being bundled and couldn't access runtime crypto.getRandomValues
    // See CRYPTO_POLYFILL_FIX.md for details
    external: (id) => {
      // Always externalize uuid and eciesjs
      if (id === 'uuid' || id.startsWith('uuid/') || 
          id === 'eciesjs' || id.startsWith('eciesjs/')) {
        return true;
      }
      return nodeExternalDeps.includes(id);
    },
    plugins: [
      ...getPlugins({ platform: 'node' }),
      nativePlugin({
        dlopen: false,
        sourcemap: true,
      }),
    ],
    onwarn: sharedWarningHandler,
  },
];

export default configs;
