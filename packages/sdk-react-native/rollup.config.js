import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import sizes from 'rollup-plugin-sizes';
import { visualizer } from 'rollup-plugin-visualizer';

// Check if environment variable is set to 'dev'
const isDev = process.env.NODE_ENV === 'dev';

const packageJson = require('./package.json');

const baseExternalDeps = [
    '@react-native-async-storage/async-storage',
    'extension-port-stream',
];

const listDepForRollup = [...baseExternalDeps];

const rnExternalDeps = [
    ...listDepForRollup,
    'qrcode-terminal-nooctal',
    'react',
    'react-native',
];

/**
 * @type {import('rollup').RollupOptions}
 */
const config = [
  {
    external: rnExternalDeps,
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.module,
        format: 'esm',
        inlineDynamicImports: true,
        sourcemap: true,
      },
    ],
    plugins: [
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
];

export default config;
