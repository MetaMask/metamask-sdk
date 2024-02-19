import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

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
        sourcemap: false,
      },
      {
        name: 'browser',
        file: packageJson.unpkg,
        format: 'umd',
        sourcemap: false,
      },
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: false,
      },
    ],
    plugins: [resolve(), commonjs(), typescript({ sourceMap: false }), terser()],
  },
];

export default config;
