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
import packageJson from './package.json'; // Ensure this path is correct

// Check if environment variable is set to 'dev'
const isDev = process.env.NODE_ENV === 'dev';

// Base external dependencies across different builds
const baseExternalDeps = [
  '@react-native-async-storage/async-storage',
];

// Dependencies for rollup to consider as external
const listDepForRollup = [
  ...baseExternalDeps,
  'cross-fetch',
  'date-fns',
  'eciesjs',
  'eventemitter2',
  'socket.io-client',
  'uuid',
];

// Keeping separate external deps list for web and react-native to allow for future divergence
const webExternalDeps = [...listDepForRollup];
const rnExternalDeps = [...listDepForRollup];

/**
 * @type {import('rollup').RollupOptions}
 */
const config = [
  // Browser builds (ES)
  {
    external: webExternalDeps,
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.browser,
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: [
      // Replace macros in your source code with environment-specific variables
      jscc({
        values: { _WEB: 1 },
      }),
      // TypeScript plugin with overridden configuration file path
      typescript({ tsconfig: './tsconfig.json' }),
      // Resolves modules specified in "node_modules"
      nodeResolve({
        browser: true, // Prefer browser versions of modules if available
        preferBuiltins: false, // Do not prefer Node.js built-ins over npm modules
        exportConditions: ['browser'], // Use "browser" field in package.json for overrides
      }),
      // Converts CommonJS modules to ES6, to be included in the Rollup bundle
      commonjs({ transformMixedEsModules: true }),
      // Polyfills Node.js globals and modules for use in the browser
      globals(),
      builtins({ crypto: true }), // Includes Node.js built-ins like 'crypto'
      // Convert .json files to ES6 modules
      json(),
      // Minify the bundle
      terser(),
      // Visualize the bundle to analyze its composition and size
      isDev && visualizer({
        filename: `bundle_stats/browser-es-stats-${packageJson.version}.html`,
      }),
    ],
  },
  // Browser builds (UMD, IIFE)
  {
    // Only considering base external deps for UMD and IIFE builds
    external: baseExternalDeps,
    input: 'src/index.ts',
    output: [
      {
        name: 'browser',
        file: packageJson.unpkg,
        format: 'umd',
        sourcemap: true,
      },
      {
        file: 'dist/browser/iife/metamask-sdk-communication-layer.js',
        format: 'iife',
        name: 'MetaMaskSDK',
        sourcemap: true,
      },
    ],
    plugins: [
      jscc({
        values: { _WEB: 1 },
      }),
      typescript({ tsconfig: './tsconfig.json' }),
      nodeResolve({
        browser: true,
        preferBuiltins: false,
        exportConditions: ['browser'],
      }),
      commonjs({ transformMixedEsModules: true }),
      globals(),
      builtins({ crypto: true }),
      json(),
      terser(),
      isDev && visualizer({
        filename: `bundle_stats/browser-umd-iife-stats-${packageJson.version}.html`,
      }),
    ],
  },
  {
    external: rnExternalDeps,
    input: 'src/index.ts',
    output: [
      {
        file: packageJson['react-native'],
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: [
      jscc({
        values: { _REACTNATIVE: 1 },
      }),
      typescript({ tsconfig: './tsconfig.json' }),
      commonjs({ transformMixedEsModules: true }),
      nodeResolve({
        mainFields: ['react-native', 'node', 'browser'],
        exportConditions: ['react-native', 'node', 'browser'],
        browser: true,
        preferBuiltins: true,
      }),
      json(),
      terser(),
      isDev && visualizer({
        filename: `bundle_stats/react-native-stats-${packageJson.version}.html`,
      }),
    ],
  },
  {
    external: listDepForRollup,
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: [
      jscc({
        values: { _NODEJS: 1 },
      }),
      nativePlugin({
        // Use `dlopen` instead of `require`/`import`.
        // This must be set to true if using a different file extension that '.node'
        dlopen: false,
        // Generate sourcemap
        sourcemap: true,
      }),
      typescript({ tsconfig: './tsconfig.json' }),
      nodeResolve({
        browser: false,
        preferBuiltins: true,
        exportConditions: ['node'],
      }),
      commonjs({ transformMixedEsModules: true }),
      json(),
      terser(),
      isDev && visualizer({
        filename: `bundle_stats/node-stats-${packageJson.version}.html`,
      }),
    ],
  },
];

export default config;
