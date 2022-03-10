import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';

const config = [
  {
    external: ['bowser'],
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
    plugins: [typescript()],
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
    plugins: [typescript(), resolve()],
  },
];

export default config;
