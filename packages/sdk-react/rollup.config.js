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
        sourcemap: false,
        sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
          // Not sure why rollup otherwise adds an extra '../' to the path

          // Adjust the path transformation logic as needed
          return relativeSourcePath.replace(/^..\//, '');
        },
      },
      {
        file: packageJson.main,
        inlineDynamicImports: true,
        format: 'cjs',
        sourcemap: false,
        sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
          // Not sure why rollup otherwise adds an extra '../' to the path

          // Adjust the path transformation logic as needed
          return relativeSourcePath.replace(/^..\//, '');
        },
      },
    ],
    plugins: [
      external(),
      typescript({ tsconfig: './tsconfig.json' }),
      nodeResolve({
        browser: true,
      }),
      commonjs(),
      json(),
      terser(),
    ],
  },
];

export default config;
