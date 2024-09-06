import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import external from 'rollup-plugin-peer-deps-external';
import { terser } from 'rollup-plugin-terser';

const packageJson = require('./package.json');

/**
 * @type {import('rollup').RollupOptions}
 */
const config = [
  {
    external: ['react', 'react-dom', 'react-native'],
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.module,
        inlineDynamicImports: true,
        format: 'esm',
        sourcemap: true,
      },
      {
        file: packageJson.main,
        inlineDynamicImports: true,
        format: 'cjs',
        sourcemap: true,
      },
    ],
    plugins: [
      external(),
      typescript({ tsconfig: './tsconfig.json', inlineSources: true, sourceMap: true, }),
      nodeResolve({
        browser: true,
      }),
      commonjs(),
      json(),
      terser(),
    ],
  },
  {
    external: ['react', 'react-dom', 'react-native'],
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/react-native/es/metamask-sdk-react.js',
        inlineDynamicImports: true,
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      external(),
      typescript({ tsconfig: './tsconfig.json', inlineSources: true, sourceMap: true, }),
      nodeResolve({
        mainFields: ['react-native', 'node', 'browser'],
        exportConditions: ['react-native', 'node', 'browser'],
        browser: true,
        preferBuiltins: true,
      }),
      commonjs(),
      json(),
      terser(),
    ],
  }
];

export default config;
