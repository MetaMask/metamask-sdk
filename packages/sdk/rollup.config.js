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
import sizes from 'rollup-plugin-sizes';
import external from 'rollup-plugin-peer-deps-external';

const packageJson = require('./package.json');

// Check if environment variable is set to 'dev'
const isDev = process.env.NODE_ENV === 'dev';

// Base external dependencies across different builds
const baseExternalDeps = ['@react-native-async-storage/async-storage'];

// Dependencies for rollup to consider as external
const listDepForRollup = [...baseExternalDeps];
const webExternalDeps = [...listDepForRollup, 'qrcode-terminal-nooctal'];
const rnExternalDeps = [...listDepForRollup, 'qrcode-terminal-nooctal'];

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
        file: 'dist/browser/es/metamask-sdk.js',
        format: 'es',
        inlineDynamicImports: true,
        sourcemap: false,
      },
    ],
    plugins: [
      external(),
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
      isDev && sizes(),
      terser(),
      // Visualize the bundle to analyze its composition and size
      isDev &&
        visualizer({
          filename: `bundle_stats/browser-es-stats-${packageJson.version}.html`,
        }),
    ],
  },
  // Browser builds (UMD, IIFE)
  {
    external: baseExternalDeps,
    input: 'src/index.ts',
    output: [
      {
        name: 'browser',
        // file: 'dist/browser/umd/metamask-sdk.js',
        file: packageJson.unpkg,
        inlineDynamicImports: true,
        format: 'umd',
        sourcemap: false,
      },
      {
        file: 'dist/browser/iife/metamask-sdk.js',
        format: 'iife',
        name: 'MetaMaskSDK',
        inlineDynamicImports: true,
        sourcemap: false,
      },
    ],
    plugins: [
      external(),
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
      isDev && sizes(),
      terser(),
      // Visualize the bundle to analyze its composition and size
      isDev &&
        visualizer({
          filename: `bundle_stats/browser-umd-iife-stats-${packageJson.version}.html`,
        }),
    ],
  },
  {
    external: rnExternalDeps,
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/react-native/es/metamask-sdk.js',
        format: 'es',
        inlineDynamicImports: true,
        sourcemap: false,
      },
    ],
    plugins: [
      external(),
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
      isDev && sizes(),
      terser(),
      isDev &&
        visualizer({
          filename: `bundle_stats/react-native-stats-${packageJson.version}.html`,
        }),
    ],
  },
  {
    external: listDepForRollup,
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/node/cjs/metamask-sdk.js',
        format: 'cjs',
        sourcemap: false,
        inlineDynamicImports: true,
      },
      {
        file: 'dist/node/es/metamask-sdk.js',
        format: 'es',
        sourcemap: false,
        inlineDynamicImports: true,
      },
    ],
    plugins: [
      external(),
      jscc({
        values: { _NODEJS: 1 },
      }),
      nativePlugin({
        // Use `dlopen` instead of `require`/`import`.
        // This must be set to true if using a different file extension that '.node'
        dlopen: false,
        // Generate sourcemap
        sourcemap: false,
      }),
      typescript({ tsconfig: './tsconfig.json' }),
      nodeResolve({
        browser: false,
        preferBuiltins: true,
        exportConditions: ['node'],
      }),
      commonjs({ transformMixedEsModules: true }),
      json(),
      isDev && sizes(),
      terser(),
      isDev &&
        visualizer({
          filename: `bundle_stats/node-stats-${packageJson.version}.html`,
        }),
    ],
  },
];

export default config;
