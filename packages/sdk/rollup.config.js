import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nativePlugin from 'rollup-plugin-natives';
import jscc from 'rollup-plugin-jscc';
import terser from '@rollup/plugin-terser';
import builtins from 'rollup-plugin-node-builtins';
import { visualizer } from 'rollup-plugin-visualizer';
import replace from '@rollup/plugin-replace';
import globals from 'rollup-plugin-polyfill-node';

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
  'readable-stream',
  // Add other dependencies that should be bundled
];

// Shared dependencies that should be deduplicated
const sharedDeps = ['eventemitter2', 'socket.io-client', 'debug', 'uuid', 'cross-fetch'];


// Filter function to exclude bundled dependencies
const excludeBundledDeps = (dep) => !bundledDeps.includes(dep);

// Used to inject "/* webpackIgnore: true */" for sdk-install-modal-web dynamic import
const injectWebpackIgnore = () => {
  return {
    name: 'inject-webpack-ignore',
    generateBundle(_, bundle) {
      for (const file of Object.keys(bundle)) {
        if (file === 'metamask-sdk.js' && bundle[file].code) {
          // Inject the webpackIgnore comment into dynamic import
          bundle[file].code = bundle[file].code.replace(
            /import\(/g,
            'import(/* webpackIgnore: true */'
          );
        }
      }
    },
  };
};

// Dependencies that should always be external
const baseExternalDeps = [
  ...peerDependencies.filter(excludeBundledDeps),
  ...optionalDependencies.filter(excludeBundledDeps),
  ...sharedDeps, // Exclude shared deps from bundle
  '@react-native-async-storage/async-storage',
  'extension-port-stream',
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

const getBasePlugins = ({ platform, format }) =>
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
    typescript({
      tsconfig: './tsconfig.build.json',
      sourceMap: true,
    }),
    json(),
    isDev &&
      ['treemap', 'sunburst', 'network', 'raw-data', 'list'].map((template) =>
        visualizer({
          filename: `bundle_stats/${platform}/${packageJson.version}/${format}_${template}${
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
      ...getBasePlugins({ platform: 'web', format: 'es' }),
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
      globals({
        include: null,
      }),
      builtins({
        crypto: true,
        stream: true,
        http: true,
        https: true,
        url: true,
        process: true,
        buffer: false,
      }),
      terser({
        format: {
          // keep all /* webpack*: * */ comments and /* vite-*: * */ comments
          comments: (_, comment) => comment.value.includes("webpack") || comment.value.includes("vite")
        }
      }),
      injectWebpackIgnore(),
    ],
    onwarn: sharedWarningHandler,
  },

  // Browser builds (UMD, IIFE)
  {
    external: [...baseExternalDeps, ...peerDependencies],
    input: 'src/index.ts',
    output: [
      {
        // UMD build - Universal Module Definition
        // Supports AMD, CommonJS, and global variable
        // Works in both Node.js and browser environments
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
        // IIFE build - Immediately Invoked Function Expression
        // Browser-only bundle that creates a single global variable
        // Simpler than UMD but only works in browsers
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
      ...getBasePlugins({ platform: 'web', format: 'umd-iife' }),
      nodeResolve({
        browser: true,
        preferBuiltins: false,
        exportConditions: ['browser'],
        dedupe: sharedDeps,
      }),
      commonjs({ transformMixedEsModules: true, include: /node_modules/ }),
      globals({
        include: null,
      }),
      builtins({ crypto: true }),
      terser({
        format: {
          // keep all /* webpack*: * */ comments and /* vite-*: * */ comments
          comments: (_, comment) => comment.value.includes("webpack") || comment.value.includes("vite")
        }
      }),
      injectWebpackIgnore(),
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
      ...getBasePlugins({ platform: 'rn', format: 'es' }),
      commonjs({ transformMixedEsModules: true }),
      nodeResolve({
        mainFields: ['react-native', 'node', 'browser'],
        exportConditions: ['react-native', 'node', 'browser'],
        browser: true,
        preferBuiltins: true,
      }),
      terser({
        format: {
          // keep all /* webpack*: * */ comments and /* vite-*: * */ comments
          comments: (_, comment) => comment.value.includes("webpack") || comment.value.includes("vite")
        }
      }),
    ],
    onwarn: sharedWarningHandler,
  },

  // Node.js build
  {
    external: nodeExternalDeps,
    input: 'src/index.ts',
    output: [
      {
        // CommonJS (CJS) build
        // Traditional Node.js module format using require/exports
        // Better compatibility with older Node.js code and environments
        file: 'dist/node/cjs/metamask-sdk.js',
        format: 'cjs',
        sourcemap: true,
        inlineDynamicImports: true,
        exports: 'named',
      },
      {
        // ES Module (ESM) build
        // Modern JavaScript module format using import/export
        // Better tree-shaking, smaller bundles, and future-proof
        file: 'dist/node/es/metamask-sdk.js',
        format: 'es',
        sourcemap: true,
        inlineDynamicImports: true,
        exports: 'named',
      },
    ],
    plugins: [
      ...getBasePlugins({ platform: 'node', format: 'cjs-es' }),
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
      terser({
        format: {
          // keep all /* webpack*: * */ comments and /* vite-*: * */ comments
          comments: (_, comment) => comment.value.includes("webpack") || comment.value.includes("vite")
        }
      }),
    ],
    onwarn: sharedWarningHandler,
  },
];

export default configs;
