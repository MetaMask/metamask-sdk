import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';

const listDepForRollup = [];

const config = [
  {
    external: listDepForRollup,
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/metamask-sdk.cjs.js',
        format: 'cjs',
      },
      {
        file: 'dist/metamask-sdk.es.js',
        format: 'es',
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
        file: 'dist/metamask-sdk.bundle.js',
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
];

export default config;
