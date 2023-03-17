import process from 'process';
import typescript from 'rollup-plugin-typescript2';
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
import run from '@rollup/plugin-run';
import json from "@rollup/plugin-json";

const listDepForRollup = [
  'buffer',
  'eciesjs',
  'cross-fetch',
  'eventemitter2',
  'socket.io-client',
  'uuid',
  'bowser',
  '@react-native-async-storage/async-storage',
  '@metamask/onboarding',
  '@metamask/providers',
  '@metamask/post-message-stream',
  'pump',
  'obj-multiplex',
  'stream',
];

const runAfter = process.env.ROLLUP_RUN === 'true';

/**
 * @type {import('rollup').RollupOptions}
 */
const config = [
  {
    external: listDepForRollup,
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/deve2e.js',
        format: 'cjs',
        sourcemap: true,
      },
    ],
    plugins: [
      typescript({ tsconfig: './tsconfig.json' }),
      json(),
      runAfter &&
        run({
          execArgv: ['-r', 'source-map-support/register'],
          args: [process.env.TARGET],
        }),
    ],
  },
];

export default config;
