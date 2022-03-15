import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodePolyfills from 'rollup-plugin-polyfill-node';

const listDepForRollup = ['bowser'];

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
      commonjs(),
      nodePolyfills(),
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
      nodePolyfills(),
      json(),
    ],
  },
];

export default config;
