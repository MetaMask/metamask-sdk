import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';
import jscc from 'rollup-plugin-jscc';
import terser from '@rollup/plugin-terser';
import { visualizer } from 'rollup-plugin-visualizer';
import sizes from 'rollup-plugin-sizes';

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
        file: 'dist/es/index.js',
        format: 'es',
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
