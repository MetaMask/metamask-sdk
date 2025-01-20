import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';

const packageJson = require('./package.json');

// Dependencies that should be external
const external = [
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.peerDependencies || {}),
  ...Object.keys(packageJson.optionalDependencies || {}),
];

/**
 * @type {import('rollup').RollupOptions[]}
 */
const configs = [
  // Node.js build
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      },
    ],
    external,
    plugins: [
      typescript({
        tsconfig: './tsconfig.build.json',
      }),
      nodeResolve({
        preferBuiltins: true,
        exportConditions: ['node'],
      }),
      commonjs(),
      json(),
      terser(),
    ],
  },
  // Browser build
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.module,
        format: 'es',
        sourcemap: true,
        exports: 'named',
      },
    ],
    external,
    plugins: [
      typescript({
        tsconfig: './tsconfig.build.json',
      }),
      nodeResolve({
        browser: true,
        preferBuiltins: false,
        exportConditions: ['browser'],
      }),
      commonjs(),
      json(),
      terser(),
    ],
  },
];

export default configs;
