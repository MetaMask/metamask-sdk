import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nativePlugin from 'rollup-plugin-natives';
import jscc from 'rollup-plugin-jscc';
import terser from '@rollup/plugin-terser';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import { visualizer } from 'rollup-plugin-visualizer';
import replace from '@rollup/plugin-replace';
import alias from '@rollup/plugin-alias';

const packageJson = require('./package.json');
const isDev = process.env.NODE_ENV === 'dev';

// Dependencies categorization
const peerDependencies = Object.keys(packageJson.peerDependencies || {});
const optionalDependencies = Object.keys(
  packageJson.optionalDependencies || {},
);
const dependencies = Object.keys(packageJson.dependencies || {});

// Dependencies that should be bundled
const bundledDeps = [
  // '@metamask/sdk-communication-layer',
  // '@metamask/sdk-install-modal-web',
  '@paulmillr/qr',
  // Add other dependencies that should be bundled
];

// Shared dependencies that should be deduplicated
const sharedDeps = ['eventemitter2', 'socket.io-client', 'debug', 'uuid'];

// Filter function to exclude bundled dependencies
const excludeBundledDeps = (dep) => !bundledDeps.includes(dep);

// Dependencies that should always be external
const baseExternalDeps = [
  ...peerDependencies.filter(excludeBundledDeps),
  ...optionalDependencies.filter(excludeBundledDeps),
  ...sharedDeps, // Exclude shared deps from bundle
  '@react-native-async-storage/async-storage',
  'extension-port-stream',
  'tslib',
];

// Platform-specific externals
const webExternalDeps = [...baseExternalDeps,].filter(
  excludeBundledDeps,
);

const rnExternalDeps = [...baseExternalDeps,].filter(
  excludeBundledDeps,
);

const nodeExternalDeps = [...baseExternalDeps].filter(excludeBundledDeps);

const sharedWarningHandler = (warning, warn) => {
  // Ignore circular dependencies for specific packages
  if (warning.code === 'CIRCULAR_DEPENDENCY') {
    const circularDependencyAllowList = [
      'semver',
      'readable-stream',
      'detect-browser',
      'stream',
      'util-deprecate',
    ];

    if (
      warning.ids.some((id) =>
        circularDependencyAllowList.some((pkg) => id.includes(pkg)),
      )
    ) {
      return;
    }
  }

  // Ignore 'this' undefined warnings for specific packages
  if (warning.code === 'THIS_IS_UNDEFINED') {
    const thisUndefinedAllowList = ['detect-browser'];

    if (thisUndefinedAllowList.some((pkg) => warning.id.includes(pkg))) {
      return;
    }
  }

  // Ignore pure annotation warnings from specific packages
  if (warning.code === 'ANNOTATION_PURE_COMMENT') {
    const pureAnnotationAllowList = ['@scure/base'];

    if (pureAnnotationAllowList.some((pkg) => warning.id.includes(pkg))) {
      return;
    }
  }

  // Show other warnings
  warn(warning);
};

const getBasePlugins = ({ platform }) =>
  [
    replace({
      preventAssignment: true,
      values: {
        'process.env.NODE_ENV': JSON.stringify(
          isDev ? 'development' : 'production',
        ),
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
    alias({
      entries: [
        { find: 'react', replacement: 'preact/compat' },
        { find: 'react-dom/test-utils', replacement: 'preact/test-utils' },
        { find: 'react-dom', replacement: 'preact/compat' },
        { find: 'react/jsx-runtime', replacement: 'preact/jsx-runtime' }
      ]
    }),
    typescript({
      tsconfig: './tsconfig.build.json',
      sourceMap: true,
    }),
    json(),
    isDev &&
      ['treemap', 'sunburst', 'network', 'raw-data', 'list'].map((template) =>
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
        }),
      ),
  ].filter(Boolean);

/**
 * @type {import('rollup').RollupOptions[]}
 */
const configs = [
  // Browser builds (ES)
  {
    external: webExternalDeps,
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.module,
        format: 'es',
        inlineDynamicImports: true,
        sourcemap: true,
        exports: 'named',
      },
    ],
    plugins: [
      ...getBasePlugins({ platform: 'web' }),
      nodeResolve({
        browser: true,
        preferBuiltins: false,
        exportConditions: ['browser'],
        dedupe: sharedDeps,
      }),
      commonjs({
        transformMixedEsModules: true,
        include: /node_modules/,
      }),
      globals(),
      builtins({
        crypto: true,
        stream: true,
        http: true,
        https: true,
        url: true,
        buffer: false,
      }),
      terser(),
    ],
    onwarn: sharedWarningHandler,
  },

  // Browser builds (UMD, IIFE)
  {
    external: [...baseExternalDeps, ...peerDependencies],
    input: 'src/index.ts',
    output: [
      {
        name: 'browser',
        file: packageJson.unpkg,
        inlineDynamicImports: true,
        format: 'umd',
        sourcemap: true,
        exports: 'named',
        globals: {
          tslib: 'tslib',
          debug: 'debug',
          eventemitter2: 'EventEmitter2',
          uuid: 'uuid',
          'socket.io-client': 'io',
          react: 'React',
          'react-dom': 'ReactDOM'
        },
      },
      {
        file: packageJson.unpkg.replace('.js', '.iife.js'),
        format: 'iife',
        name: 'MetaMaskSDK',
        inlineDynamicImports: true,
        sourcemap: true,
        exports: 'named',
        globals: {
          tslib: 'tslib',
          debug: 'debug',
          eventemitter2: 'EventEmitter2',
          uuid: 'uuid',
          'socket.io-client': 'io',
          react: 'React',
          'react-dom': 'ReactDOM'
        },
      },
    ],
    plugins: [
      ...getBasePlugins({ platform: 'web' }),
      nodeResolve({
        browser: true,
        preferBuiltins: false,
        exportConditions: ['browser'],
        dedupe: sharedDeps,
      }),
      commonjs({ transformMixedEsModules: true, include: /node_modules/ }),
      globals(),
      builtins({ crypto: true }),
      terser(),
    ],
    onwarn: sharedWarningHandler,
  },

  // React Native build
  {
    external: rnExternalDeps,
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/react-native/es/metamask-sdk.js',
        format: 'es',
        inlineDynamicImports: true,
        sourcemap: true,
        exports: 'named',
      },
    ],
    plugins: [
      ...getBasePlugins({ platform: 'rn' }),
      commonjs({ transformMixedEsModules: true }),
      nodeResolve({
        mainFields: ['react-native', 'node', 'browser'],
        exportConditions: ['react-native', 'node', 'browser'],
        browser: true,
        preferBuiltins: true,
      }),
      terser(),
    ],
    onwarn: sharedWarningHandler,
  },

  // Node.js build
  {
    external: nodeExternalDeps,
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/node/cjs/metamask-sdk.js',
        format: 'cjs',
        sourcemap: true,
        inlineDynamicImports: true,
        exports: 'named',
      },
      {
        file: 'dist/node/es/metamask-sdk.js',
        format: 'es',
        sourcemap: true,
        inlineDynamicImports: true,
        exports: 'named',
      },
    ],
    plugins: [
      ...getBasePlugins({ platform: 'node' }),
      nativePlugin({
        dlopen: false,
        sourcemap: true,
      }),
      nodeResolve({
        browser: false,
        preferBuiltins: true,
        exportConditions: ['node'],
      }),
      commonjs({ transformMixedEsModules: true }),
      terser(),
    ],
    onwarn: sharedWarningHandler,
  },
];

export default configs;
