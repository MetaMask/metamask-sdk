import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import path from 'node:path';
import typescript from '@rollup/plugin-typescript';
// import typescript from 'rollup-plugin-typescript2';
import terser from '@rollup/plugin-terser';
// import external from 'rollup-plugin-peer-deps-external';
// import postcss from 'rollup-plugin-postcss';
import json from '@rollup/plugin-json';

const packageJson = require('./package.json');

/**
 * @type {import('rollup').RollupOptions}
 */
const config = [
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.module,
        format: 'es',
        sourcemap: true,
      },
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({ sourceMap: true }),
      terser(),
    ],
  },
];

export default config;
