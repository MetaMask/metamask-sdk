import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nativePlugin from 'rollup-plugin-natives';
import jscc from 'rollup-plugin-jscc';
import terser from '@rollup/plugin-terser';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';

const packageJson = require('./package.json');

const listDepForRollup = ['@react-native-async-storage/async-storage'];
const webExternalDeps = [...listDepForRollup, 'qrcode-terminal'];
const rnExternalDeps = [...listDepForRollup, 'qrcode-terminal'];

/**
 * @type {import('rollup').RollupOptions}
 */
const config = [
  {
    external: webExternalDeps,
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/browser/es/metamask-sdk.js',
        format: 'es',
        inlineDynamicImports: true,
        sourcemap: true,
      },
      {
        name: 'browser',
        // file: 'dist/browser/umd/metamask-sdk.js',
        file: packageJson.unpkg,
        inlineDynamicImports: true,
        format: 'umd',
        sourcemap: true,
      },
      {
        file: 'dist/browser/iife/metamask-sdk.js',
        format: 'iife',
        name: 'MetaMaskSDK',
        inlineDynamicImports: true,
        sourcemap: true,
      },
    ],
    plugins: [
      jscc({
        values: { _WEB: 1 },
      }),
      nodeResolve({
        browser: true,
        preferBuiltins: false,
      }),
      commonjs({ transformMixedEsModules: true }),
      typescript({ tsconfig: './tsconfig.json' }),
      globals(),
      builtins({ crypto: true }),
      json(),
      terser(),
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
        sourcemap: true,
      },
    ],
    plugins: [
      jscc({
        values: { _REACTNATIVE: 1 },
      }),
      typescript({ tsconfig: "./tsconfig.json" }),
      commonjs({ transformMixedEsModules: true }),
      nodeResolve({
        mainFields: ['react-native', 'node', 'browser'],
        exportConditions: ['react-native', 'node', 'browser'],
        browser: true,
        preferBuiltins: true,
      }),
      json(),
      terser()
    ],
  },
  {
    external: listDepForRollup,
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/node/cjs/metamask-sdk.js',
        format: 'cjs',
        sourcemap: true,
        inlineDynamicImports: true,
      },
      {
        file: 'dist/node/es/metamask-sdk.js',
        format: 'es',
        sourcemap: true,
        inlineDynamicImports: true,
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
      typescript({ tsconfig: "./tsconfig.json" }),
      nodeResolve({
        browser: false,
        preferBuiltins: true,
        exportConditions: ['node']
      }),
      commonjs({ transformMixedEsModules: true }),
      json(),
      terser()
    ],
  },
];

export default config;
