import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import nativePlugin from 'rollup-plugin-natives';

const listDepForRollup = [];

const config = [
  {
    external: listDepForRollup,
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/cjs/browser/metamask-sdk.js',
        format: 'cjs',
      },
      {
        file: 'dist/es/browser/metamask-sdk.js',
        format: 'es',
      },
      {
        name: 'browser',
        file: 'dist/umd/browser/metamask-sdk.js',
        format: 'umd',
      },
    ],
    plugins: [
      typescript(),
      nodeResolve({ browser: true, preferBuiltins: false }),
      commonjs({ transformMixedEsModules: true }),
      globals(),
      builtins({ crypto: true }),
      json(),
    ],
  },
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/iife/browser/metamask-sdk.js',
        format: 'iife',
        name: 'MetaMaskSDK',
      },
    ],
    plugins: [
      typescript(),
      nodeResolve({ browser: true, preferBuiltins: false }),
      commonjs(),
      globals(),
      builtins({ crypto: true }),
      json(),
    ],
  },
  {
    external: listDepForRollup,
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/cjs/node/metamask-sdk.js',
        format: 'cjs',
      },
      {
        file: 'dist/es/node/metamask-sdk.js',
        format: 'es',
      },
    ],
    plugins: [
      nativePlugin({
        // Use `dlopen` instead of `require`/`import`.
        // This must be set to true if using a different file extension that '.node'
        dlopen: false,
        // Generate sourcemap
        sourcemap: true,
      }),
      typescript(),
      nodeResolve({ browser: false, preferBuiltins: false }),
      commonjs({ transformMixedEsModules: true }),
      json(),
    ],
  },
];

export default config;
